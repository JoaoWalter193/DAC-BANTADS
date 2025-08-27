package msgerente.controllers;


import msgerente.domain.Gerente;
import msgerente.services.GerenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/gerentes")
public class GerenteController {

    @Autowired
    private GerenteService gerenteService;

    @GetMapping
    public ResponseEntity<List<Gerente>> listarGerentes(){
        return gerenteService.listarGerentes();
    }



}
