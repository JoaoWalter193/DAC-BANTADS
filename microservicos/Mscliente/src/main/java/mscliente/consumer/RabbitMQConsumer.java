package mscliente.consumer;


import com.fasterxml.jackson.core.JsonProcessingException;

import mscliente.domain.AlteracaoPerfilDTO;
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

        if (data.email().equals("Erro Conta")){

            clienteService.deletarContaErro(data.cpf());

        } else {

            if (data.email().equals("Aprovar Conta")) {
                clienteService.aprovarCliente(data.cpf());
            } else {
                clienteService.adicionarCliente(data);

                ResponseDTO responseTemp = new ResponseDTO(201, data.cpf(), data.nome(), data.salario(), "msCliente");
                rabbitMQProducer.sendClienteSaga(responseTemp);
            }
        }
    }


    //teste pedro alteracaoperfil
    @RabbitListener(queues = {"AtualizarCliente"})
    public void atualizarCliente(AlteracaoPerfilDTO dados) {
        LOGGER.info(String.format("saga->cliente teste 'AtualizarCliente' CPF: %s", dados.dadosAtualizados().cpf()));
        
        try {
            clienteService.atualizarClienteSaga(dados.dadosAtualizados());
            LOGGER.info("Cliente atualizado com sucesso. Publicando evento de sucesso.");
            rabbitMQProducer.clienteAtualizadoSucesso(dados);

        } catch (Exception e) {
            LOGGER.error("Falha ao atualizar cliente. Publicando evento de falha.", e);
            // Descomentar quando implementar falha
            // rabbitMQProducer.clienteAtualizadoFalha(dados);
        }
    }

}
