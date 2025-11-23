package mscliente.consumer;

import mscliente.domain.*;
import mscliente.producer.RabbitMQProducer;
import mscliente.repositories.ClienteRepository;
import mscliente.services.ClienteService;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {

    @Autowired
    ClienteService clienteService;

    @Autowired
    RabbitMQProducer rabbitMQProducer;

    @Autowired
    ClienteRepository clienteRepository;


    @RabbitListener(queues = "queue-cliente-criar")
    public void processarCriacaoCliente(AutocadastroDTO sagaDTO) {
        System.out.println("MS-CLIENTE: Recebi ordem de criação para SAGA: " + sagaDTO.sagaId());
        AutocadastroDTO resultado = clienteService.sagaAutocadastrar(sagaDTO);
        rabbitMQProducer.enviarRespostaSaga(resultado);
    }

    @RabbitListener(queues = "queue-cliente-rollback")
    public void processarRollbackCliente(AutocadastroDTO sagaDTO) {
        System.out.println("MS-CLIENTE: Recebi ordem de ROLLBACK para SAGA: " + sagaDTO.sagaId());
        clienteService.sagaAutocadastrarRollback(sagaDTO);
    }

    @RabbitListener(queues = "queue-cliente-aprovar")
    public void aprovarCliente(@Payload AprovacaoDTO saga) {
        System.out.println("MS-CLIENTE: Recebido comando de aprovação para CPF: " + saga.cpf());

        Optional<Cliente> clienteOpt = clienteRepository.findByCpf(saga.cpf());

        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();

            cliente.setStatus("APROVADO");
            clienteRepository.save(cliente);

            AprovacaoDTO respostaSucesso = new AprovacaoDTO(
                    saga.sagaId(),
                    cliente.getCpf(),
                    cliente.getNome(),
                    "CLIENTE_APROVADO",
                    "SUCESSO",
                    null,
                    cliente.getSalario(),
                    cliente.getEmail());

            System.out.println("MS-CLIENTE: Cliente aprovado. Retornando dados para Orquestrador.");
            rabbitMQProducer.enviarRespostaSaga(respostaSucesso);

        } else {
            System.err.println("MS-CLIENTE: Erro - Cliente não encontrado: " + saga.cpf());

            AprovacaoDTO respostaErro = new AprovacaoDTO(
                    saga.sagaId(),
                    saga.cpf(),
                    saga.nome(),
                    "CLIENTE_ERRO",
                    "FALHA",
                    "Cliente não encontrado na base para aprovação",
                    0.0,
                    saga.email());
            rabbitMQProducer.enviarRespostaSaga(respostaErro);
        }
    }

    // teste pedro alteracaoperfil
    @RabbitListener(queues = { "AtualizarCliente" })
    public void atualizarCliente(AlteracaoPerfilDTO dados) {
        System.out.println("saga->cliente teste atualizarCliente cliente consumer ");
        try {
            clienteService.atualizarClienteSaga(dados.dadosAtualizados());
            System.out.println("cliente->saga atualizarCliente cliente consumer.");
            rabbitMQProducer.clienteAtualizadoSucesso(dados);
        } catch (Exception e) {
            System.out.println("Falha ao atualizar cliente. cliente consumer.");
            rabbitMQProducer.clienteAtualizadoFalha(dados);
        }
    }

    @RabbitListener(queues = { "AtualizarClienteFalha" })
    public void atualizarClienteFalha(ClienteDTO dadosOriginais) {
        System.out.println("saga->cliente teste atualizarClienteFalha cliente consumer");
        try {
            clienteService.reverterPara(dadosOriginais);
            System.out.println("teste reverter - cliente consumer.");
        } catch (Exception e) {
            System.out.println("Falha na reversao.");
        }
    }
}