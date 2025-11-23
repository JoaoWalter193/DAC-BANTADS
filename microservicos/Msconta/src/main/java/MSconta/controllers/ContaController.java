package MSconta.controllers;

import MSconta.domain.*;
import MSconta.domain.GerentesDTOs.GerenteDashDTO;
import MSconta.services.ContaCUDService;
import MSconta.services.ContaRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contas")
public class ContaController {

    // tem que fazer um CRUD porem na parte do GET ele
    // vai pegar da conta de leitura, o resto vai fazer primero
    // no banco de insercao , depois mandar mensgaem para fila que ele vai ouvir
    // e vai uar para inserir os dados no banco de Query

    @Autowired
    ContaCUDService contaCUDService;

    @Autowired
    ContaRService contaRService;

    @PostMapping
    public ResponseEntity<String> criarConta(@RequestBody AdicionarContaDTO data) {
        return contaCUDService.adicionarConta(data);
    }

    @PutMapping("/{numConta}/depositar")
    public ResponseEntity<ContaPadraoDTO> depositarCliente(@PathVariable Integer numConta,
            @RequestBody double valorDepositar) {
        return contaCUDService.depositarCliente(numConta, valorDepositar);
    }

    @PutMapping("/{numConta}/sacar")
    public ResponseEntity<ContaPadraoDTO> sacarCliente(@PathVariable Integer numConta, @RequestBody double valorSacar) {
        return contaCUDService.sacarCliente(numConta, valorSacar);
    }

    @PutMapping("/{numConta}/transferir")
    public ResponseEntity<String> transferirDinheiro(@PathVariable Integer numConta, @RequestBody TransferirDTO data) {
        return contaCUDService.transferir(numConta, data);
    }

    @PutMapping("/{numConta}")
    public ResponseEntity<ContaPadraoDTO> atualizarLimite(@PathVariable Integer numConta, @RequestBody double limite) {
        return contaCUDService.alteracaoPerfilLimite(numConta, limite);
    }

    // vai ser chamado para construir o dashboard
    @GetMapping("/gerentes")
    public ResponseEntity<List<GerenteDashDTO>> buscarGerentesDash() {
        return contaRService.buscarGerentes();

    }

    @GetMapping("/melhoresClientes")
    public ResponseEntity<List<ContaR>> buscarMelhoresClientes() {
        return contaRService.buscarMelhoresClientes();
    }

    @GetMapping("/{numConta}/extrato")
    public ResponseEntity<ExtratoDTO> buscarExtrato(@PathVariable Integer numConta) {
        return contaRService.verExtrato(numConta);
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<ContaPadraoDTO> buscarCpfCliente(@PathVariable String cpf) {
        return contaRService.buscarCpfCLiente(cpf);
    }

    @GetMapping("/{numConta}/saldo")
    public ResponseEntity<ContaPadraoDTO> buscarContaCliente(@PathVariable Integer numConta) {
        return contaRService.buscarContaCliente(numConta);
    }

}
