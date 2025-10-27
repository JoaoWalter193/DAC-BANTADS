package msauth.ms_auth.consumer;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import msauth.ms_auth.producer.AuthProducer;
import msauth.ms_auth.service.AuthService;
import msauth.ms_auth.dto.SagaRequest;

@Service
public class RabbitMQConsumer {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthProducer authProducer;

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

   @RabbitListener(queues = {"${rabbitmq.queue.auth-create}"})
    public void consume(SagaRequest request) {
        String sagaId = request.getSagaId();
        LOGGER.info("Recebido evento de criação de auth para Saga ID: {}", sagaId);

        try {
            authService.criarAutenticacao(request);

            LOGGER.info("Autenticação criada com sucesso para Saga ID: {}", sagaId);
            authProducer.sendSuccessEvent(sagaId, "Autenticação criada com sucesso.");

        } catch (Exception e) {
            LOGGER.error("Falha ao criar autenticação para Saga ID: {}. Erro: {}", sagaId, e.getMessage());
            authProducer.sendFailEvent(sagaId, "Falha no ms-auth: " + e.getMessage());
        }
    }
}
