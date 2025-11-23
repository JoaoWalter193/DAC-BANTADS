package msauth.ms_auth.producer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import msauth.ms_auth.dto.AprovacaoDTO;
import msauth.ms_auth.dto.AutocadastroDTO;

@Service
public class AuthProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthProducer.class);
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.saga}")
    private String exchange;

    @Value("${rabbitmq.key.saga-orchestrator}")
    private String routingKeyOrquestrador;

    @Value("${rabbitmq.key.saga-response}")
    private String routingKeySagaResposta;

    public AuthProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void enviarRespostaSaga(AutocadastroDTO saga) {
        LOGGER.info("MS-AUTH: Enviando resposta (Autocadastro) para Orchestrator -> Status: {}", saga.status());
        rabbitTemplate.convertAndSend(exchange, routingKeyOrquestrador, saga);
    }

    public void enviarRespostaSaga(AprovacaoDTO saga) {
        LOGGER.info("MS-AUTH: Enviando resposta (Aprovação) para rota: {}", routingKeySagaResposta);
        rabbitTemplate.convertAndSend(exchange, routingKeySagaResposta, saga);
    }
}