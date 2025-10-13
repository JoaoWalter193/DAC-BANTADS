package msSaga.msSaga.producer;


import msSaga.msSaga.DTO.AutocadastroDTO;
import msSaga.msSaga.consumer.RabbitMQConsumer;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class RabbitMQProducer {

    @Value("exchangePrincipal")
    private String exchange;

    @Value("keyCliente")
    private String routingKeyCliente;


    @Autowired
    private RabbitTemplate rabbitTemplate;

    public RabbitMQProducer(RabbitTemplate rabbitTemplate){
        this.rabbitTemplate = rabbitTemplate;
    }



    public void sendContaCliente(AutocadastroDTO data){
        rabbitTemplate.convertAndSend(exchange, routingKeyCliente, data);
    }

}
