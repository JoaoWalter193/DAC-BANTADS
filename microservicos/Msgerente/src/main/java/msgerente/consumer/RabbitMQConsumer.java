package msgerente.consumer;


import msgerente.domain.*;
import msgerente.producer.RabbitMQProducer;
import msgerente.services.GerenteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {

    @Autowired
    GerenteService gerenteService;

    @Autowired
    RabbitMQProducer rabbitMQProducer;

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    @RabbitListener(queues = {"MsGerente"})
    public void consume(GerenteMsDTO message){

        LOGGER.info(String.format("Menasgem consumida -> %s",message));

        if (message.acao().equals("Criar")){

            AdicionarGerenteDTO dtoTemp = new AdicionarGerenteDTO(message.cpf(), message.nome(), message.email(), message.senha(), message.tipo());
            gerenteService.inserirGerente(dtoTemp);

            ResponseDTO responseDTO = new ResponseDTO(201, message.cpf(), message.nome(), 0.0, "msGerente-criar");
            rabbitMQProducer.sendMessageSaga(responseDTO);
        }

        if (message.acao().equals("Deletar")){

            gerenteService.deletarGerente(message.cpf());


            ResponseDTO responseDTO = new ResponseDTO(200, message.cpf(), message.nome(), 0.0, "msGerente-deletar");
            rabbitMQProducer.sendMessageSaga(responseDTO);
        }

        if (message.acao().equals("Atualizar")){

            AtualizarGerenteDTO dtoTemp = new AtualizarGerenteDTO(message.nome(), message.email(), message.senha());
            gerenteService.atualizarGerente(message.cpf(), dtoTemp);


            ResponseDTO responseDTO = new ResponseDTO(200, message.cpf(), message.nome(), 0.0, "msGerente-atualizar");
            rabbitMQProducer.sendMessageSaga(responseDTO);

        }


    }

}
