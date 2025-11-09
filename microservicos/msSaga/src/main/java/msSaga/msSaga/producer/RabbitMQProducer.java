package msSaga.msSaga.producer;


import msSaga.msSaga.DTO.AlteracaoPerfilDTO;
import msSaga.msSaga.DTO.AutocadastroDTO;
import msSaga.msSaga.DTO.ClienteDTO;
import msSaga.msSaga.DTO.ContaDTO;
import msSaga.msSaga.DTO.GerenteMsDTO;
import msSaga.msSaga.DTO.ResponseDTO;
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

    @Value("keyConta")
    private String routingKeyConta;

    @Value("keyGerente")
    private String routingKeyGerente;

// teste pedro alteracaoperfil
    @Value("keyAtualizarCliente") 
    private String routingKeyAtualizarCliente;

    @Value("keyAtualizarConta")
    private String routingKeyAtualizarLimite;

    @Value("keyAtualizarClienteFalha")
    private String routingKeyAtualizarClienteFalha;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public RabbitMQProducer(RabbitTemplate rabbitTemplate){
        this.rabbitTemplate = rabbitTemplate;
    }



    public void sendContaCliente(AutocadastroDTO data){
        rabbitTemplate.convertAndSend(exchange, routingKeyCliente, data);
    }

    public void sendContaConta(ResponseDTO data){
       // envio apenas os dados do cliente, e dentro do Ms-Conta ele vai automaticamente pegar um gerente
        rabbitTemplate.convertAndSend(exchange,routingKeyConta, data);
    }

    public void sendGerenteExcluirAdd(ResponseDTO data){
        rabbitTemplate.convertAndSend(exchange, routingKeyConta, data);
    }

    public void sendGerenteMsGerente(GerenteMsDTO data){
        rabbitTemplate.convertAndSend(exchange,routingKeyGerente,data);
    }

// teste pedro alteracaoperfil
    public void sendAtualizarCliente(AlteracaoPerfilDTO dados) {
        System.out.println("saga->cliente teste sendAtualizarCliente saga producer");
        rabbitTemplate.convertAndSend(exchange, routingKeyAtualizarCliente, dados);
    }

    public void sendAtualizarLimite(AlteracaoPerfilDTO dados) { 
        System.out.println("saga->conta teste sendAtualizarLimite saga producer");
        rabbitTemplate.convertAndSend(exchange, routingKeyAtualizarLimite, dados);
    }

    public void sendAtualizarFalha(ClienteDTO dadosOriginais) {
        System.out.println("saga->conta teste sendAtualizarFalha saga producer ");
        rabbitTemplate.convertAndSend(exchange, routingKeyAtualizarClienteFalha, dadosOriginais);
    }

}
