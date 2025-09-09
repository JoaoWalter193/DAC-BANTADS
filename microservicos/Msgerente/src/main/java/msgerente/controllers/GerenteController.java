package msgerente.controllers;


import msgerente.domain.Gerente;
import msgerente.dto.GerenteDTO;
import msgerente.services.GerenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import msgerente.producer.RabbitMQProducer;

import java.util.List;

@RestController
@RequestMapping("/gerentes")
public class GerenteController {

    @Autowired
    private RabbitMQProducer producer;

    @Autowired
    private GerenteService gerenteService;

//    @GetMapping
  //  public ResponseEntity<List<Gerente>> listarGerentes(){
    //    return gerenteService.listarGerentes();
    // }

    @GetMapping("/{cpf}")
    public ResponseEntity<GerenteDTO> consultarGerente(@PathVariable String cpf){
        return ResponseEntity.ok(gerenteService.consultarGerente(cpf));
    }

    @PostMapping
    public ResponseEntity<GerenteDTO> inserirGerente(GerenteDTO dto, String senha){
        return ResponseEntity.ok(gerenteService.inserirGerente(dto, senha));
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<GerenteDTO> atualizarGerente(String cpf, GerenteDTO dto){
        return ResponseEntity.ok(gerenteService.atualizarGerente(cpf, dto));
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> deletarGerente(String cpf){
        gerenteService.deletarGerente(cpf);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/teste")
    public ResponseEntity<String> sendMessage(@RequestParam("mensagem") String message){
        producer.sendMessage(message);
        return ResponseEntity.ok("Mensgaem enviada para rabbitmq ");
    }

}
