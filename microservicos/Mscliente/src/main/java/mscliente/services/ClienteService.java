package mscliente.services;


import mscliente.domain.*;
import mscliente.producer.RabbitMQProducer;
import mscliente.repositories.ClienteRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.StandardPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ClienteService {


    @Autowired
    ClienteRepository clienteRepository;

    @Autowired
    RabbitMQProducer rabbitMQProducer;

    @Autowired
    EmailService emailService;


    private Map<String, String> cpfParaSenha = new HashMap<>();

    // PasswordEncoder passwordEncoder = new StandardPasswordEncoder("razer");



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
            return ResponseEntity.ok(listaDTO);

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
            // ISSO AQUI TÁ IMPLANTADO LÁ NO MS-CONTA, SÓ CHAMAR COM GET /melhoresCLientes


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

    public ResponseEntity<ClienteDTO> adicionarCliente(AutocadastroDTO data){
        //implementar
        //gerar Senha aleatoria
        Optional<Cliente> optCliente = clienteRepository.findByCpf(data.cpf());

        if (optCliente.isPresent()){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }


        String senhaAleatoria = RandomStringUtils.random(5,true,true);
        // String senhaHasheada = passwordEncoder.encode(senhaAleatoria);

        Cliente clienteTemp = new Cliente(
                data.cpf(),
                data.nome(),
                data.email(),
                "",
                // senhaHasheada, // classe que pega a senha, joga pra SHA256 + SALT e retorna o HASH
                data.salario(),
                data.endereco(),
                data.cep(),
                data.cidade(),
                data.estado(),
                "AGUARDANDO",
                ""
        );
        clienteRepository.save(clienteTemp);

        cpfParaSenha.put(clienteTemp.getCpf(),senhaAleatoria);

        AuthRequest authRequest = new AuthRequest(data.email(), senhaAleatoria);
        rabbitMQProducer.sendAuthSaga(authRequest);

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

    public ResponseEntity<ClienteDTO> aprovarCliente(String cpf){

        Optional<Cliente> optCliente = clienteRepository.findByCpf(cpf);
        if (optCliente.isPresent()){
            Cliente clienteTemp = optCliente.get();
            clienteTemp.setStatus("APROVADO");

            clienteRepository.save(clienteTemp);

            ResponseDTO responseTemp = new ResponseDTO(200,
                    clienteTemp.getCpf(),
                    clienteTemp.getNome(),
                    clienteTemp.getSalario(),
                    "msCliente-aprovado");
            rabbitMQProducer.sendClienteSaga(responseTemp);



            //falta enviar o e-mail para o mano com a senha da conta confirmando que recebeu
            String senhaDeshasheada = cpfParaSenha.remove(clienteTemp.getCpf());
            emailService.sendPasswordEmail(clienteTemp.getEmail(),clienteTemp.getNome(), senhaDeshasheada);

            return ResponseEntity.ok(new ClienteDTO(clienteTemp.getCpf(),
                    clienteTemp.getNome(),
                    clienteTemp.getEmail(),
                    clienteTemp.getSalario(),
                    clienteTemp.getEndereco(),
                    clienteTemp.getCep(),
                    clienteTemp.getCidade(),
                    clienteTemp.getEstado()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        }

    }

    public ResponseEntity<GeralDTO> rejeitarCliente (String cpf,String motivoRejeite){
        Optional<Cliente> clienteOpt = clienteRepository.findByCpf(cpf);
        if (clienteOpt.isPresent()){


            Cliente clienteTemp = clienteOpt.get();
            clienteTemp.setStatus("REJEITADO");
            clienteTemp.setMotivoRejeite(motivoRejeite + " -- Hora do rejeite: " + LocalDateTime.now());
            clienteRepository.save(clienteTemp);

            emailService.sendRejeicao(clienteTemp.getEmail(),clienteTemp.getNome(),motivoRejeite);

            return ResponseEntity.ok(new GeralDTO("200", "Cliente Rejeitado com o motivo de:" + motivoRejeite));

        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    //
    // atualização e compensação
    //
    public void atualizarClienteSaga(ClienteDTO dadosAtualizados) {
        // Busca o cliente no banco de dados
        Optional<Cliente> optCliente = clienteRepository.findByCpf(dadosAtualizados.cpf());

        if (optCliente.isEmpty()) {
            // Lança uma exceção que será capturada pelo consumidor do RabbitMQ
            throw new RuntimeException("Cliente com CPF " + dadosAtualizados.cpf() + " não encontrado para atualização.");
        }
        
        Cliente cliente = optCliente.get();
        // Atualiza os campos necessários com os dados do DTO
        cliente.setNome(dadosAtualizados.nome());
        cliente.setSalario(dadosAtualizados.salario());
        cliente.setEmail(dadosAtualizados.email());
        cliente.setEndereco(dadosAtualizados.endereco());
        cliente.setCep(dadosAtualizados.cep());
        cliente.setCidade(dadosAtualizados.cidade());
        cliente.setEstado(dadosAtualizados.estado());

        // Salva as alterações no banco de dados
        clienteRepository.save(cliente);
    }

    /**
     * Reverte os dados de um cliente para um estado anterior. Chamado pela Saga em caso de compensação.
     */
    public void reverterPara(ClienteDTO dadosOriginais) {
        Optional<Cliente> optCliente = clienteRepository.findByCpf(dadosOriginais.cpf());

        if (optCliente.isPresent()) {
            Cliente cliente = optCliente.get();
            // Restaura os dados originais do cliente
            cliente.setNome(dadosOriginais.nome());
            cliente.setSalario(dadosOriginais.salario());
            cliente.setEmail(dadosOriginais.email());
            cliente.setEndereco(dadosOriginais.endereco());
            cliente.setCep(dadosOriginais.cep());
            cliente.setCidade(dadosOriginais.cidade());
            cliente.setEstado(dadosOriginais.estado());
            clienteRepository.save(cliente);
        } else {
            // Se o cliente não foi encontrado, a compensação pode ser simplesmente logar um aviso.
            System.err.println("AVISO: Tentativa de compensação para um cliente não encontrado (CPF: " + dadosOriginais.cpf() + ").");
        }
    }

}
