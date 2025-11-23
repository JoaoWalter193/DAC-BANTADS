package msSaga.msSaga.producer;

import msSaga.msSaga.DTO.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQProducer.class);
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.saga:exchangePrincipal}")
    private String exchange;

    @Value("${rabbitmq.key.cliente-criar}")
    private String keyClienteCriar;

    @Value("${rabbitmq.key.auth-criar}")
    private String keyAuthCriar;

    @Value("${rabbitmq.key.conta-criar}")
    private String keyContaCriar;

    @Value("${rabbitmq.key.cliente-rollback}")
    private String keyClienteRollback;

    @Value("${rabbitmq.key.cliente-aprovar}")
    private String keyClienteAprovar;

    @Value("${rabbitmq.key.auth-aprovar}")
    private String keyAuthAprovar;

    @Value("${rabbitmq.key.atualizar-cliente}")
    private String keyAtualizarCliente;

    @Value("${rabbitmq.key.atualizar-limite}")
    private String keyAtualizarLimite;

    @Value("${rabbitmq.key.atualizar-cliente-falha}")
    private String keyAtualizarClienteFalha;

    @Value("${rabbitmq.key.gerente:keyGerente}")
    private String keyGerente;

    public RabbitMQProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }


    public void enviarParaMsCliente(AutocadastroDTO saga) {
        LOGGER.info("Enviando solicitação de CRIAÇÃO para MS-Cliente. SagaID: {}", saga.sagaId());
        rabbitTemplate.convertAndSend(exchange, keyClienteCriar, saga);
    }

    public void enviarParaMsAuth(AutocadastroDTO saga) {
        LOGGER.info("Enviando solicitação de CRIAÇÃO para MS-Auth. SagaID: {}", saga.sagaId());
        rabbitTemplate.convertAndSend(exchange, keyAuthCriar, saga);
    }

    public void enviarParaMsConta(AutocadastroDTO saga) {
        LOGGER.info("Enviando solicitação de CRIAÇÃO para MS-Conta. SagaID: {}", saga.sagaId());
        rabbitTemplate.convertAndSend(exchange, keyContaCriar, saga);
    }

    public void enviarRollbackCliente(AutocadastroDTO saga) {
        LOGGER.warn("Enviando ROLLBACK para MS-Cliente. SagaID: {}", saga.sagaId());
        rabbitTemplate.convertAndSend(exchange, keyClienteRollback, saga);
    }

    public void enviarAprovacaoCliente(AprovacaoDTO saga) {
        rabbitTemplate.convertAndSend(exchange, keyClienteAprovar, saga);
    }

    public void enviarCriacaoContaAprovada(AprovacaoDTO saga) {
        LOGGER.info("SAGA PRODUCER: Enviando solicitação de CRIAÇÃO DE CONTA (aprovada)");
        rabbitTemplate.convertAndSend(exchange, keyContaCriar, saga);
    }

    public void enviarAprovacaoAuth(AprovacaoDTO saga) {
        rabbitTemplate.convertAndSend(exchange, keyAuthAprovar, saga);
    }

    public void sendAtualizarCliente(AlteracaoPerfilDTO dados) {
        rabbitTemplate.convertAndSend(exchange, keyAtualizarCliente, dados);
    }

    public void sendAtualizarLimite(AlteracaoPerfilDTO dados) {
        rabbitTemplate.convertAndSend(exchange, keyAtualizarLimite, dados);
    }

    public void sendAtualizarFalha(ClienteDTO dadosOriginais) {
        rabbitTemplate.convertAndSend(exchange, keyAtualizarClienteFalha, dadosOriginais);
    }

    public void enviarSagaGerente(GerenteMsDTO dto) {
        LOGGER.info("Enviando comando para MS-Gerente. Ação: {}", dto.acao());
        rabbitTemplate.convertAndSend(exchange, keyGerente, dto);
    }
}