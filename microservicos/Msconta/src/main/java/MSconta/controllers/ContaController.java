package MSconta.controllers;


import MSconta.domain.AdicionarContaDTO;
import MSconta.domain.ContaPadraoDTO;
import MSconta.services.ContaCUDService;
import MSconta.services.ContaRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<String> criarConta (@RequestBody AdicionarContaDTO data){
        return contaCUDService.adicionarConta(data);
    }

    @PutMapping("/{numConta}/depositar")
    public ResponseEntity<ContaPadraoDTO> depositarCliente(@PathVariable String numConta, @RequestBody double valorDepositar){
        return contaCUDService.depositarCliente(numConta,valorDepositar);
    }

    @PutMapping("/{numConta}/sacar")
    public ResponseEntity<ContaPadraoDTO> sacarCliente(@PathVariable String numConta, @RequestBody double valorSacar){
        return contaCUDService.sacarCliente(numConta, valorSacar);
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<ContaPadraoDTO> buscarCpfCliente(@PathVariable String cpf) {
        return contaRService.buscarCpfCLiente(cpf);
    }

    @GetMapping("/{numConta}/saldo")
    public ResponseEntity<ContaPadraoDTO> buscarContaCliente(@PathVariable String numConta){
        return contaRService.buscarContaCliente(numConta);
    }

}
