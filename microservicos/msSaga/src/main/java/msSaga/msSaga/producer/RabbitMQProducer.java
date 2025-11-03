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

    @Value("keyAtualizarCliente") 
    private String routingKeyAtualizarCliente;

    @Value("keyAtualizarLimiteConta")
    private String routingKeyAtualizarLimite;

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
        System.out.println("teste saga->cliente");
        rabbitTemplate.convertAndSend(exchange, routingKeyAtualizarCliente, dados);
    }

    public void sendAtualizarLimite(ClienteDTO dadosCliente) { 
        System.out.println("teste saga->conta limite");
        rabbitTemplate.convertAndSend(exchange, routingKeyAtualizarLimite, dadosCliente);
    }

}
