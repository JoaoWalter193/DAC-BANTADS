package mscliente.producer;

import mscliente.domain.AlteracaoPerfilDTO;
import mscliente.domain.AprovacaoDTO;
import mscliente.domain.ResponseDTO;
import mscliente.domain.AuthRequest;
import mscliente.domain.AutocadastroDTO;

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

    private static final String ROUTING_KEY_SAGA_RESPOSTA = "MsSaga-response";

    public void enviarRespostaSaga(AutocadastroDTO sagaDTO) {
        System.out.println("MS-CLIENTE: Devolvendo SAGA (Autocadastro) para: " + ROUTING_KEY_SAGA_RESPOSTA);
        rabbitTemplate.convertAndSend(exchange, ROUTING_KEY_SAGA_RESPOSTA, sagaDTO);
    }

    public void enviarRespostaSaga(AprovacaoDTO saga) {
        System.out.println("MS-CLIENTE: Devolvendo SAGA (Aprovação) para: " + ROUTING_KEY_SAGA_RESPOSTA);
        rabbitTemplate.convertAndSend(exchange, ROUTING_KEY_SAGA_RESPOSTA, saga);
    }

    @Value("${rabbitmq.key.saga-create-auth}")
    private String authSagaRoutingKey;

    @Value("keySaga")
    private String routingKeySaga;

    @Value("keyAtualizacaoClienteSucesso")
    private String routingKeyAtualizacaoClienteSucesso;

    @Value("keyAtualizarClienteFalha")
    private String routingKeyAlteracaoPerfilFalha;

    public void sendAuthSaga(AuthRequest data) {
        LOGGER.info(String.format("Enviando evento AUTH_CREATE para SAGA -> Email: %s", data.email()));
        rabbitTemplate.convertAndSend(exchange, authSagaRoutingKey, data);
    }

    public void sendClienteSaga(ResponseDTO data) {
        rabbitTemplate.convertAndSend(exchange, routingKeySaga, data);
    }

    public void sendMessageSaga(int cod, String cpfCliente, String nomeCliente, double salario) {
        ResponseDTO message = new ResponseDTO(cod, cpfCliente, nomeCliente, salario, "msCliente", null);
        rabbitTemplate.convertAndSend(exchange, routingKeySaga, message);
    }

    public void sendErrorSaga(String email) {
        ResponseDTO message = new ResponseDTO(500, email, null, null, "Erro ms-conta -- criar cliente", null);
        rabbitTemplate.convertAndSend(exchange, routingKeySaga, message);
    }

    public void clienteAtualizadoSucesso(AlteracaoPerfilDTO dados) {
        rabbitTemplate.convertAndSend(exchange, routingKeyAtualizacaoClienteSucesso, dados);
    }

    public void clienteAtualizadoFalha(AlteracaoPerfilDTO dados) {
        rabbitTemplate.convertAndSend(exchange, routingKeyAlteracaoPerfilFalha, dados);
    }
}