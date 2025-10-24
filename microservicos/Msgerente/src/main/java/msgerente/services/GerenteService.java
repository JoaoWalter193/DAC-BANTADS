package msgerente.services;


import msgerente.domain.*;

import msgerente.repositories.GerenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import msgerente.producer.RabbitMQProducer;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GerenteService {

    @Autowired
    RabbitMQProducer rabbitMQProducer;

    @Autowired
    GerenteRepository gerenteRepository;

    private String teste = "Teste 123";


    public ResponseEntity<GerenteDTO> infoGerente(String cpf){
        Gerente gerenteTemp = gerenteRepository.findByCpf(cpf);
        GerenteDTO respTemp = new GerenteDTO(gerenteTemp.getCpf(), gerenteTemp.getNome(), gerenteTemp.getEmail(), gerenteTemp.getTipo());
        return ResponseEntity.ok(respTemp);
    }

    public ResponseEntity<List<Gerente>> listarGerentes() {
        List<Gerente> listaTemp = gerenteRepository.findAll();
        if (listaTemp.size() != 0 ){
            return ResponseEntity.ok(listaTemp);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(listaTemp);
        }
    }


    public ResponseEntity<GerenteDTO> atualizarGerente(String cpf, AtualizarGerenteDTO data){
        Gerente gerenteTemp = gerenteRepository.findByCpf(cpf);
            gerenteTemp.setNome(data.nome());
            gerenteTemp.setEmail(data.email());
            gerenteTemp.setSenha(data.senha());

            GerenteDTO dto = new GerenteDTO(gerenteTemp.getCpf(), gerenteTemp.getNome(), gerenteTemp.getEmail(), gerenteTemp.getTipo());

            gerenteRepository.save(gerenteTemp);
            return ResponseEntity.ok(dto);
    }

    public ResponseEntity<GerenteDTO> inserirGerente (AdicionarGerenteDTO data){
        Gerente gerenteTemp = new Gerente(data.cpf(), data.nome(), data.email(), data.senha(), data.tipo());

        if (gerenteRepository.findByCpf(data.cpf()) != null){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        gerenteRepository.save(gerenteTemp);

        // enviar gerente para adicionar contas no Ms-conta
        ResponseDTO responseTemp = new ResponseDTO(201,
                data.cpf(),
                data.nome(),
                0.0,
                "msGerente-add");
        rabbitMQProducer.sendMessageSaga(responseTemp);


        return ResponseEntity.ok(new GerenteDTO(data.cpf(), data.nome(), data.email(), data.tipo()));

    }


    public ResponseEntity<GerenteDTO> deletarGerente (String cpf){

        Gerente gerenteTemp = gerenteRepository.findByCpf(cpf);

        if (gerenteTemp != null){

            gerenteRepository.delete(gerenteTemp);

            //enviar gerente para excluir das contas
            ResponseDTO responseTemp = new ResponseDTO(200,
                    gerenteTemp.getCpf(),
                    gerenteTemp.getNome(),
                    0.0,
                    "msGerente-excluir");
            rabbitMQProducer.sendMessageSaga(responseTemp);


            GerenteDTO dto = new GerenteDTO(gerenteTemp.getCpf(),gerenteTemp.getNome(),gerenteTemp.getEmail(), gerenteTemp.getTipo());
            return ResponseEntity.ok(dto);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }


}
