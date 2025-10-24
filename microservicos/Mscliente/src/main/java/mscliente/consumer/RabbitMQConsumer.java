package mscliente.consumer;


import com.fasterxml.jackson.core.JsonProcessingException;
import mscliente.domain.AutocadastroDTO;
import mscliente.domain.ResponseDTO;
import mscliente.producer.RabbitMQProducer;
import mscliente.services.ClienteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {

    @Autowired
    ClienteService clienteService;

    @Autowired
    RabbitMQProducer rabbitMQProducer;

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    @RabbitListener(queues = {"MsCliente"})
    public void consume(AutocadastroDTO data) throws JsonProcessingException {

        if (data.email().equals("Aprovar Conta")){
            clienteService.aprovarCliente(data.cpf());
        } else {
            clienteService.adicionarCliente(data);

            ResponseDTO responseTemp = new ResponseDTO(201, data.cpf(), data.nome(), data.salario(), "msCliente");
            rabbitMQProducer.sendClienteSaga(responseTemp);
        }
    }

}
