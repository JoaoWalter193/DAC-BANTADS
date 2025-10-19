package msSaga.msSaga.consumer;



import msSaga.msSaga.DTO.ContaDTO;
import msSaga.msSaga.DTO.ResponseDTO;
import msSaga.msSaga.producer.RabbitMQProducer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class RabbitMQConsumer {

    @Autowired
    RabbitMQProducer rabbitMQProducer;

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    @RabbitListener(queues = {"MsSaga"})
    public void consume(ResponseDTO message){
        // A mensagem que eu vou receber aqui não vai ser só uma string, vai ser uma msg com todos os dados do cliente e um cmapo de resposta
        // e os if's serão baseados nesse campo


        if (message.cod() == 201 && message.ms().equals("msCliente")){
            // lógica após adicionar cliente em Cliente
            // VOU FAZER MOMENTANEAMENTE A LÓGICA DE ENVIAR DIRETO PARA CONTA MAS DEPOIS AQUI TEM QUE SER ONDE ENVIA O MS-AUTH E RECEBENDO DO AUTH ELE ENVIA PRA CONTA

            ContaDTO contaTemp = new ContaDTO(message.cpfCliente(),
                    message.nomeCliente(),
                    message.salario());
            rabbitMQProducer.sendContaConta(contaTemp);


        }







    }

}
