package mscliente.controllers;

import mscliente.domain.AdicionarClienteDTO;
import mscliente.domain.ClienteDTO;
import mscliente.services.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping ("/clientes")
public class ClienteController {


    @Autowired
    private ClienteService clienteService;


    @GetMapping
    public ResponseEntity<List<ClienteDTO>> listarClientes(@RequestParam("filtro") String filtro ){
        return clienteService.buscarClientes(filtro);
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<ClienteDTO> buscarCliente(@PathVariable String cpf){
        return clienteService.buscarCliente(cpf);
    }


    @PostMapping
    public ResponseEntity<ClienteDTO> adicionarCliente(@RequestBody AdicionarClienteDTO data){
        return clienteService.adicionarCliente(data);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<ClienteDTO> atualizarCliente(@RequestBody AdicionarClienteDTO data, @PathVariable String cpf){
        return clienteService.atualizarCliente(data,cpf);
    }

    // básicos foram, agora tem que mexer na parada de APROVAR E REJEITAR porém isso vou fazer só
    // depois que aprender os microservicos, no momento apenas fazendo as coisas que não necessitam de
    // microserviços para não ficar maluco






}
