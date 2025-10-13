package msSaga.msSaga.consumer;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {


    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    @RabbitListener(queues = {"MsSaga"})
    public void consume(String message){

        LOGGER.info(String.format("Menasgem consumida -> %s",message)




        );
    }

}
