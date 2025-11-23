package msSaga.msSaga.controller;


import jakarta.validation.Valid;
import msSaga.msSaga.DTO.*;
import msSaga.msSaga.services.SagaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class SagaController {


    @Autowired
    SagaService sagaService;

    @PostMapping("/clientes")
    public ResponseEntity<testeProfessorDTO> sagaAutoCadastro (@RequestBody @Valid AutocadastroDTO data) {
        return sagaService.autoCadastro(data);
    }

    @DeleteMapping("/gerentes/{cpf}")
    public ResponseEntity<RespostaPadraoDTO> sagaRemoverGerente (@PathVariable String cpf){
        return sagaService.removerGerente(cpf);
    }

    @PutMapping("/gerentes/{cpf}")
    public ResponseEntity<RespostaPadraoDTO> sagaAtualizarGerente (@PathVariable String cpf, @RequestBody @Valid GerenteAttDTO data){
        return sagaService.atualizarGerente(cpf,data);
    }

    @PostMapping("/gerentes")
    public ResponseEntity<RespostaPadraoDTO> sagaAdicionarGerente (@RequestBody @Valid GerenteMsDTO data){
        return sagaService.inserirGerente(data);
    }

    @PostMapping("clientes/{cpf}/aprovar")
    public ResponseEntity<String> sagaAprovarCliente (@PathVariable String cpf){
        return sagaService.sagaAprovarCliente(cpf);
    }

// teste pedro alteracaoperfil
    @PostMapping("/alterar-perfil")
    public ResponseEntity<RespostaPadraoDTO> sagaAlteracaoPerfil(@RequestBody AlteracaoPerfilDTO dados) {
        sagaService.executarSagaAlteracaoPerfil(dados);
        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(new RespostaPadraoDTO("teste3 alteração de perfil.", HttpStatus.ACCEPTED.value()));
    }

}
