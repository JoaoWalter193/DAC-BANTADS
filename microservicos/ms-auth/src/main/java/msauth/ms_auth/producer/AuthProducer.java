package msauth.ms_auth.producer;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import msauth.ms_auth.dto.SagaEvent;

@Service
public class AuthProducer {

    private final TopicExchange sagaExchange_1;

    @Value("${rabbitmq.exchange.saga}")
    private String sagaExchange;

    @Value("${rabbitmq.key.saga-create-success}")
    private String sagaAuthSuccessKey;

    @Value("${rabbitmq.key.saga-create-fail}")
    private String sagaAuthFailKey;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public AuthProducer(RabbitTemplate rabbitTemplate, TopicExchange sagaExchange_1) {
        this.rabbitTemplate = rabbitTemplate;
        this.sagaExchange_1 = sagaExchange_1;
    }

    public void sendSuccessEvent(String sagaId, String payload) {
        SagaEvent message = new SagaEvent(sagaId, "AUTH_SUCCESS", payload);
        rabbitTemplate.convertAndSend(sagaExchange, sagaAuthSuccessKey, message);
    }

    public void sendFailEvent(String sagaId, String errorMessage) {
        SagaEvent message = new SagaEvent(sagaExchange, "AUTH_FAIL", errorMessage);
        rabbitTemplate.convertAndSend(sagaExchange, sagaAuthFailKey, message);
    }



}
