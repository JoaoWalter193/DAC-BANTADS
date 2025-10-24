package mscliente.controllers;

import jakarta.validation.Valid;
import mscliente.domain.AdicionarClienteDTO;
import mscliente.domain.AutocadastroDTO;
import mscliente.domain.ClienteDTO;
import mscliente.domain.GeralDTO;
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
    public ResponseEntity<ClienteDTO> adicionarCliente(@RequestBody AutocadastroDTO data){
        return clienteService.adicionarCliente(data);
    }

    // ISSO AQUI TEM QUE VIRAR UMA SAGA
//    @PostMapping("/{cpf}/aprovar")
//    public ResponseEntity<ClienteDTO> aprovarCliente(@PathVariable String cpf){
//        return clienteService.aprovarCliente(cpf);
//    }

    @PostMapping("/{cpf}/rejeitar")
    public ResponseEntity<GeralDTO> rejeitarCliente(@PathVariable String cpf,@RequestBody @Valid String motivoRejeite){
        return clienteService.rejeitarCliente(cpf,motivoRejeite);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<ClienteDTO> atualizarCliente(@RequestBody AdicionarClienteDTO data, @PathVariable String cpf){
        return clienteService.atualizarCliente(data,cpf);
    }

    // básicos foram, agora tem que mexer na parada de APROVAR E REJEITAR porém isso vou fazer só
    // depois que aprender os microservicos, no momento apenas fazendo as coisas que não necessitam de
    // microserviços para não ficar maluco





}
