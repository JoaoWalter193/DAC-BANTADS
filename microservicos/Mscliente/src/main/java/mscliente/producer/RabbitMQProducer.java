package mscliente.producer;


import mscliente.domain.ResponseDTO;
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

    public RabbitMQProducer(RabbitTemplate rabbitTemplate){
        this.rabbitTemplate = rabbitTemplate;
    }




    public void sendClienteSaga(ResponseDTO data){
        System.out.println("DEBUG - Nome recebido: " + data.nome());
        System.out.println("DEBUG - CPF recebido: " + data.cpf());
        rabbitTemplate.convertAndSend(exchange,routingKeySaga,data);
    }
}
