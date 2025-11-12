package mscliente.producer;

import mscliente.config.RabbitMQConfig;
import mscliente.domain.AlteracaoPerfilDTO;
import mscliente.domain.ResponseDTO;
import mscliente.domain.AuthRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQProducer.class);

    @Value("exchangePrincipal")
    private String exchange;

    @Value("keySaga")
    private String routingKeySaga;


    @Value("${rabbitmq.key.saga-create-auth}")
    private String authSagaRoutingKey;

    // teste pedro alteracaoperfil
    @Value("keyAtualizacaoClienteSucesso")
    private String routingKeyAtualizacaoClienteSucesso;

    @Value("keyAtualizarClienteFalha")
    private String routingKeyAlteracaoPerfilFalha;


    public RabbitMQProducer(RabbitTemplate rabbitTemplate){
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendAuthSaga(AuthRequest data){
        LOGGER.info(String.format("Enviando evento AUTH_CREATE para SAGA -> Email: %s", data.email()));
        rabbitTemplate.convertAndSend(exchange, authSagaRoutingKey, data);
    }


    public void sendClienteSaga(ResponseDTO data){
        System.out.println("DEBUG - Nome recebido: " + data.nome());
        System.out.println("DEBUG - CPF recebido: " + data.cpf());
        rabbitTemplate.convertAndSend(exchange,routingKeySaga,data);
    }
    public void sendMessageSaga(int cod, String cpfCliente, String nomeCliente, double salario){
        ResponseDTO message = new ResponseDTO(cod, cpfCliente,nomeCliente,salario, "msCliente",null);
        rabbitTemplate.convertAndSend(exchange,routingKeySaga,message);
    }

    public void sendErrorSaga(String email){

        ResponseDTO message = new ResponseDTO(500,email,
                null ,null,
                "Erro ms-conta -- criar cliente -- ms-cliente",
                null);;
        rabbitTemplate.convertAndSend(exchange,routingKeySaga,message);
    }

    // teste pedro alteracaoperfil
    public void clienteAtualizadoSucesso(AlteracaoPerfilDTO dados) {
        System.out.println("cliente->saga teste clienteAtualizadoSucesso cliente producer");
        rabbitTemplate.convertAndSend(exchange, routingKeyAtualizacaoClienteSucesso, dados);
    }

    public void clienteAtualizadoFalha(AlteracaoPerfilDTO dados) {
        System.out.println("cliente->saga teste clienteAtualizadoFALHA cliente producer");
        rabbitTemplate.convertAndSend(exchange, routingKeyAlteracaoPerfilFalha, dados);
    }
}
