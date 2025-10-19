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




    public void sendMessageSaga(int cod, String cpfCliente, String nomeCliente, double salario){
        ResponseDTO message = new ResponseDTO(cod, cpfCliente,nomeCliente,salario, "msCliente");
        rabbitTemplate.convertAndSend(exchange,routingKeySaga,message);
    }

}
