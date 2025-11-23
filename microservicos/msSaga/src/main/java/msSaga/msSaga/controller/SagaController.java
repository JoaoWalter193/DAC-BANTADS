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
    public ResponseEntity<RespostaPadraoDTO> sagaAutoCadastro(@RequestBody @Valid AutocadastroDTO data) {
        sagaService.iniciarAutocadastro(data);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RespostaPadraoDTO(
                        "Solicitação de cadastro recebida. Aguarde o e-mail de confirmação.",
                        HttpStatus.CREATED.value()));
    }

    @DeleteMapping("/gerentes/{cpf}")
    public ResponseEntity<RespostaPadraoDTO> sagaRemoverGerente(@PathVariable String cpf) {
        sagaService.iniciarRemocaoGerente(cpf);

        return ResponseEntity.accepted()
                .body(new RespostaPadraoDTO("Processo de remoção de gerente iniciado.", 202));
    }

    @PutMapping("/gerentes/{cpf}")
    public ResponseEntity<RespostaPadraoDTO> sagaAtualizarGerente(@PathVariable String cpf,
            @RequestBody @Valid GerenteAttDTO data) {
        sagaService.iniciarAtualizacaoGerente(cpf, data);

        return ResponseEntity.accepted()
                .body(new RespostaPadraoDTO("Processo de atualização de gerente iniciado.", 202));
    }

    @PostMapping("/gerentes")
    public ResponseEntity<RespostaPadraoDTO> sagaAdicionarGerente(@RequestBody @Valid GerenteMsDTO data) {
        sagaService.iniciarInsercaoGerente(data);

        return ResponseEntity.accepted()
                .body(new RespostaPadraoDTO("Processo de criação de gerente iniciado.", 202));
    }

    @PostMapping("clientes/{cpf}/aprovar")
    public ResponseEntity<String> sagaAprovarCliente(@PathVariable String cpf) {
        sagaService.iniciarAprovarCliente(cpf);
        return ResponseEntity.accepted().body("Solicitação de aprovação enviada.");
    }

    @PostMapping("/alterar-perfil")
    public ResponseEntity<RespostaPadraoDTO> sagaAlteracaoPerfil(@RequestBody AlteracaoPerfilDTO dados) {
        sagaService.iniciarAlteracaoPerfil(dados);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new RespostaPadraoDTO("Solicitação de alteração de perfil em processamento.",
                        HttpStatus.ACCEPTED.value()));
    }
}