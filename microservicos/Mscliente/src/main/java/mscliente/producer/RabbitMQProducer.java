package mscliente.producer;


import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQProducer {


    @Value("exchangePrincipal")
    private String exchange;

    @Value("keySaga")
    private String routingKeySaga;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendMessageSaga(String message){
        rabbitTemplate.convertAndSend(exchange,routingKeySaga,message);
    }

}
