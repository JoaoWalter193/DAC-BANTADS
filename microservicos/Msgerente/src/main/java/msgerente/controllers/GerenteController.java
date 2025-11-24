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

import msgerente.producer.RabbitMQProducer;

import java.util.List;

@RestController
@RequestMapping("/gerentes")
public class GerenteController {

    @Autowired
    private RabbitMQProducer producer;

    @Autowired
    private GerenteService gerenteService;

    @GetMapping("/lista")
    public ResponseEntity<List<Gerente>> listarGerentesLista() {
        return gerenteService.listarGerentes();
    }

    @GetMapping
    public ResponseEntity<List<Gerente>> listarGerentes() {
        return gerenteService.listarGerentes();
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<GerenteDTO> infoGerente(@PathVariable String cpf) {
        return gerenteService.infoGerente(cpf);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<GerenteDTO> atualizarGerente(@PathVariable String cpf,
            @RequestBody AtualizarGerenteDTO data) {
        return gerenteService.atualizarGerente(cpf, data);
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<GerenteDTO> deletarGerente(@PathVariable String cpf) {
        return gerenteService.deletarGerente(cpf);
    }

    @PostMapping
    public ResponseEntity<GerenteDTO> adicionarGerente(@RequestBody @Valid AdicionarGerenteDTO data) {
        return gerenteService.inserirGerente(data);
    }

}
