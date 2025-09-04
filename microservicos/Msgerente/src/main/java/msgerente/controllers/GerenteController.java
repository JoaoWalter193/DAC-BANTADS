package msgerente.controllers;


import msgerente.domain.Gerente;
import msgerente.services.GerenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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


    @GetMapping("/teste")
    public ResponseEntity<String> sendMessage(@RequestParam("mensagem") String message){
        producer.sendMessage(message);
        return ResponseEntity.ok("Mensgaem enviada para rabbitmq ");
    }

}
