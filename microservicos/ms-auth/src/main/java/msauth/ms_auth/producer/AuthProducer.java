package msauth.ms_auth.producer;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import msauth.ms_auth.dto.SagaEvent;

@Service
public class AuthProducer {


    @Value("${rabbitmq.exchange.saga}")
    private String sagaExchange;

    @Value("${rabbitmq.key.saga-create-success}")
    private String sagaAuthSuccessKey;

    @Value("${rabbitmq.key.saga-create-fail}")
    private String sagaAuthFailKey;

    private final AmqpTemplate rabbitTemplate;

    public AuthProducer(AmqpTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
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
