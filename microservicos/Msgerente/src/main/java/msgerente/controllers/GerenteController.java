package msgerente.controllers;


import jakarta.validation.Valid;
import msgerente.domain.AdicionarGerenteDTO;
import msgerente.domain.AtualizarGerenteDTO;
import msgerente.domain.Gerente;
import msgerente.domain.GerenteDTO;
import msgerente.services.GerenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public ResponseEntity<List<Gerente>> listarGerentes(){
        return gerenteService.listarGerentes();
     }

     @GetMapping("/{cpf}")
     public ResponseEntity<GerenteDTO>infoGerente(@PathVariable String cpf){
        return gerenteService.infoGerente(cpf);
     }

     @PutMapping("/{cpf}")
     public ResponseEntity<GerenteDTO> atualizarGerente(@PathVariable String cpf, @RequestBody AtualizarGerenteDTO data){
        return gerenteService.atualizarGerente(cpf,data);
     }

     @PostMapping
     public ResponseEntity<GerenteDTO> adicionarGerente(@RequestBody @Valid AdicionarGerenteDTO data){
        return gerenteService.inserirGerente(data);
     }

    @GetMapping("/teste")
    public ResponseEntity<String> sendMessage(@RequestParam("mensagem") String message){
        producer.sendMessage(message);
        return ResponseEntity.ok("Mensgaem enviada para rabbitmq ");
    }

}
