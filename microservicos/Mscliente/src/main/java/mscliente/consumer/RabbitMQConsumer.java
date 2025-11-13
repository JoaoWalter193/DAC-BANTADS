package mscliente.consumer;


import com.fasterxml.jackson.core.JsonProcessingException;

import mscliente.domain.AlteracaoPerfilDTO;
import mscliente.domain.AutocadastroDTO;
import mscliente.domain.ClienteDTO;
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

        if (data.email().equals("Erro ms-conta -- criar client")){
            clienteService.deletarContaErro(data.cpf());

        } else {

            if (data.email().equals("Aprovar Conta")) {
                clienteService.aprovarCliente(data.cpf());
            } else {
                clienteService.adicionarCliente(data);


            }
        }
    }


//teste pedro alteracaoperfil
    @RabbitListener(queues = {"AtualizarCliente"})
    public void atualizarCliente(AlteracaoPerfilDTO dados) {
        System.out.println("saga->cliente teste atualizarCliente cliente consumer ");
        
        try {
            clienteService.atualizarClienteSaga(dados.dadosAtualizados());
            System.out.println("cliente->saga atualizarCliente cliente consumer.");
            rabbitMQProducer.clienteAtualizadoSucesso(dados);
        
        } catch (Exception e) {
            System.out.println("Falha ao atualizar cliente. cliente consumer.");
            rabbitMQProducer.clienteAtualizadoFalha(dados);
        }
    }

    @RabbitListener(queues = {"AtualizarClienteFalha"}) 
    public void atualizarClienteFalha(ClienteDTO dadosOriginais) {
        System.out.println("saga->cliente teste atualizarClienteFalha cliente consumer");
        
        try {
            clienteService.reverterPara(dadosOriginais);
            System.out.println("teste reverter - cliente consumer.");
            
        } catch (Exception e) {
            System.out.println("Falha na reversao.");
        }
    }

}
