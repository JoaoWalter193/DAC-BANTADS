package msSaga.msSaga.controller;


import jakarta.validation.Valid;
import msSaga.msSaga.DTO.AutocadastroDTO;
import msSaga.msSaga.DTO.RespostaPadraoDTO;
import msSaga.msSaga.services.SagaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SagaController {


    @Autowired
    SagaService sagaService;

    @PostMapping("/autocadastrar")
    public ResponseEntity<RespostaPadraoDTO> sagaAutoCadastro (@RequestBody @Valid AutocadastroDTO data) {
        return sagaService.autoCadastro(data);
    }


}
