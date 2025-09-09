package msgerente.services;


import msgerente.domain.Gerente;
import msgerente.dto.GerenteDTO;
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

    public ResponseEntity<List<Gerente>> listarGerentes() {
        List<Gerente> listaTemp = gerenteRepository.findAll();
        if (listaTemp.size() != 0 ){
            return ResponseEntity.ok(listaTemp);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(listaTemp);
        }
    }

    public GerenteDTO consultarGerente(String cpf) {
        return gerenteRepository.findById(cpf)
                .map(GerenteDTO::new)
                .orElseThrow(() -> new RuntimeException("Gerente não encontrado"));
    }

    public GerenteDTO inserirGerente(GerenteDTO dto, String senha) {
        Gerente gerente = new Gerente();
        gerente.setCpf(dto.getCpf());
        gerente.setNome(dto.getNome());
        gerente.setEmail(dto.getEmail());
        gerente.setTipo(dto.getTipo());
        gerente.setSenha(senha);
        gerente = gerenteRepository.save(gerente);
        return new GerenteDTO(gerente);
    }

    public GerenteDTO atualizarGerente(String cpf, GerenteDTO dto) {
        Gerente gerente = gerenteRepository.findByCpf(cpf);
        if (gerente != null) {
            gerente.setNome(dto.getNome());
            gerente.setEmail(dto.getEmail());
            gerente.setTipo(dto.getTipo());
            gerente = gerenteRepository.save(gerente);
            return new GerenteDTO(gerente);
        } else {
            throw new RuntimeException("Gerente não encontrado");
        }
    }
    
    public void deletarGerente(String cpf) {
        Gerente gerente = gerenteRepository.findByCpf(cpf);
        if (gerente != null) {
            gerenteRepository.delete(gerente);
        } else {
            throw new RuntimeException("Gerente não encontrado");
        }
    }


}
