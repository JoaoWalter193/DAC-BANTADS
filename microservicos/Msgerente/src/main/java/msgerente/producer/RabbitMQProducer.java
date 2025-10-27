package msgerente.producer;


import msgerente.domain.ResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQProducer {

    @Value("exchangePrincipal")
    private String exchange;

    @Value("keyGerente")
    private String routingKey;

    @Value("keySaga")
    private String routingKeySaga;


    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQProducer.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendMessage(String message){
        LOGGER.info(String.format("Message sent -> %s, com routingKey: %s", message,routingKey));
        rabbitTemplate.convertAndSend(exchange,routingKey,message);
    }

    public void sendMessageSaga(ResponseDTO data){
        rabbitTemplate.convertAndSend(exchange, routingKeySaga, data);
    }









}
