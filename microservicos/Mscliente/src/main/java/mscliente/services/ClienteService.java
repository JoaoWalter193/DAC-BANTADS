package mscliente.services;


import mscliente.domain.AdicionarClienteDTO;
import mscliente.domain.Cliente;
import mscliente.domain.ClienteDTO;
import mscliente.repositories.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.StandardPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {


    @Autowired
    ClienteRepository clienteRepository;

        // falar com o professor, pra saber se está válido isso aqui
    PasswordEncoder passwordEncoder = new StandardPasswordEncoder("razer");



    public ResponseEntity<List<ClienteDTO>> buscarClientes(String filtro) {

        if (filtro.equals("adm_relatorio_clientes")) {
            // todos os clientes
            List<Cliente> listaTemp = clienteRepository.findAll();
            List<ClienteDTO> listaDTO = new ArrayList<>();

            for (Cliente cliente : listaTemp) {
                ClienteDTO temp = new ClienteDTO(
                        cliente.getCpf(),
                        cliente.getNome(),
                        cliente.getEmail(),
                        cliente.getSalario(),
                        cliente.getEndereco(),
                        cliente.getCep(),
                        cliente.getCidade(),
                        cliente.getEstado()
                );
                listaDTO.add(temp);
            }
            return ResponseEntity.ok(listaDTO); // AGORA COM RETURN

        } else if (filtro.equals("para_aprovar")){

            List<Cliente> listaTemp = clienteRepository.findByStatus("AGUARDANDO");
            List<ClienteDTO> listaDTO = new ArrayList<>();

            for (Cliente cliente : listaTemp) {
                ClienteDTO temp = new ClienteDTO(
                        cliente.getCpf(),
                        cliente.getNome(),
                        cliente.getEmail(),
                        cliente.getSalario(),
                        cliente.getEndereco(),
                        cliente.getCep(),
                        cliente.getCidade(),
                        cliente.getEstado()
                );
                listaDTO.add(temp);
            }
            return ResponseEntity.ok(listaDTO);

        } else if (filtro.equals("melhores_clientes")){
            //AQUI VOU TER QUE FAZER UMA LÓGICA ONDE O MS-CONTA VAI VER QUEM TEM MAIOR SALDO, BUSCAR OS 3 CPF'S PARA PODER PESQUISAR AQUI, (n faco ideia de como fazer ainda)
            return ResponseEntity.ok(new ArrayList<>());
        } else {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }



    public ResponseEntity<ClienteDTO> buscarCliente(String cpf){
        Optional<Cliente> clienteOpt = clienteRepository.findByCpf(cpf);

        if (clienteOpt.isPresent()){
            Cliente clienteTemp = clienteOpt.get();
            ClienteDTO dtoTemp = new ClienteDTO(
                    clienteTemp.getCpf(),
                    clienteTemp.getNome(),
                    clienteTemp.getEmail(),
                    clienteTemp.getSalario(),
                    clienteTemp.getEndereco(),
                    clienteTemp.getCep(),
                    clienteTemp.getCidade(),
                    clienteTemp.getEstado());

            return ResponseEntity.ok(dtoTemp);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<ClienteDTO> adicionarCliente(AdicionarClienteDTO data){
        //implementar

        String senhaHasheada = passwordEncoder.encode(data.senha());


        Cliente clienteTemp = new Cliente(
                data.cpf(),
                data.nome(),
                data.email(),
                senhaHasheada, // classe que pega a senha, joga pra SHA256 + SALT e retorna o HASH
                data.salario(),
                data.endereco(),
                data.cep(),
                data.cidade(),
                data.estado(),
                "AGUARDANDO"
        );
        clienteRepository.save(clienteTemp);



        return ResponseEntity.ok(new ClienteDTO(clienteTemp.getCpf(),
                clienteTemp.getNome(),
                clienteTemp.getEmail(),
                clienteTemp.getSalario(),
                clienteTemp.getEndereco(),
                clienteTemp.getCep(),
                clienteTemp.getCidade(),
                clienteTemp.getEstado()));
    }



    public ResponseEntity<ClienteDTO> atualizarCliente(AdicionarClienteDTO data, String cpf){
        Optional<Cliente> optCliente = clienteRepository.findByCpf(cpf);

        if (optCliente.isPresent()) {
            Cliente clienteTemp = optCliente.get();
            clienteTemp.setNome(data.nome());
            clienteTemp.setEmail(data.email());
            clienteTemp.setSalario(data.salario());
            clienteTemp.setEndereco(data.endereco());
            clienteTemp.setCep(data.cep());
            clienteTemp.setCidade(data.cidade());
            clienteTemp.setEstado(data.estado());

            clienteRepository.save(clienteTemp);

            return ResponseEntity.ok(new ClienteDTO(clienteTemp.getCpf(),
                    data.nome(),
                    data.email(),
                    data.salario(),
                    data.endereco(),
                    data.cep(),
                    data.cidade(),
                    data.estado()));
        }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

}
