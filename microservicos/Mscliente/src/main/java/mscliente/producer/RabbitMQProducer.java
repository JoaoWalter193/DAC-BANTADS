package mscliente.producer;

import mscliente.config.RabbitMQConfig;
import mscliente.domain.AlteracaoPerfilDTO;
import mscliente.domain.ResponseDTO;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("exchangePrincipal")
    private String exchange;

    @Value("keySaga")
    private String routingKeySaga;

    public RabbitMQProducer(RabbitTemplate rabbitTemplate){
        this.rabbitTemplate = rabbitTemplate;
    }




    public void sendClienteSaga(ResponseDTO data){
        System.out.println("DEBUG - Nome recebido: " + data.nome());
        System.out.println("DEBUG - CPF recebido: " + data.cpf());
        rabbitTemplate.convertAndSend(exchange,routingKeySaga,data);
    }
    public void sendMessageSaga(int cod, String cpfCliente, String nomeCliente, double salario){
        ResponseDTO message = new ResponseDTO(cod, cpfCliente,nomeCliente,salario, "msCliente");
        rabbitTemplate.convertAndSend(exchange,routingKeySaga,message);
    }

}
