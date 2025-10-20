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

    public void sendMessageSaga(int cod, String cpfCliente, String nomeCliente, double salario){
        ResponseDTO message = new ResponseDTO(cod, cpfCliente,nomeCliente,salario, "msCliente");
        rabbitTemplate.convertAndSend(exchange,routingKeySaga,message);
    }


    //
    // atualização e compensação
    //
    public void publicarEventoClienteAtualizadoSucesso(AlteracaoPerfilDTO dados) {
        // Envia o evento de SUCESSO com a chave de roteamento correta
        rabbitTemplate.convertAndSend(RabbitMQConfig.SAGA_EXCHANGE, "cliente.atualizado.sucesso", dados);
    }

    public void publicarEventoClienteAtualizadoFalha(AlteracaoPerfilDTO dados) {
        // Envia o evento de FALHA com a chave de roteamento correta
        rabbitTemplate.convertAndSend(RabbitMQConfig.SAGA_EXCHANGE, "cliente.atualizado.falha", dados);
    }
}
