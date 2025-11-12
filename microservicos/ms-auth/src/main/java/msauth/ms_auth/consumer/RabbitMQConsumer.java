package msauth.ms_auth.consumer;


import msauth.ms_auth.dto.AuthRequest;
import msauth.ms_auth.dto.ResponseDTO;
import msauth.ms_auth.dto.SagaEvent;
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


    // AQUI ELE ESTÁ OUVINDO NA FILA MSAUTH PARA RECEBER A RESPOSTA PADRÃO QUE EU ESTOU USANDO PARA TUDO :D
    @RabbitListener(queues = {"MsAuth"})
       public void receber(ResponseDTO data){

       if (data.ms().equals("Erro ms-conta -- criar cliente -- ms-cliente")){
           authService.deletarAutenticacao(data.cpf());
       } else {

           LOGGER.info("Recebido na queue MsAuth " + data.senha());

           String[] parts = data.senha().split("-");


           SagaRequest request = new SagaRequest("idFalso",
                   parts[1],
                   parts[0]);

           try {
               authService.criarAutenticacao(request);
               LOGGER.info("Autenticação criada com sucesso para Saga ID: {}", parts[1] + " -- " + parts[0]);

               ResponseDTO temp = new ResponseDTO(201, data.cpf(),
                       data.nome(), data.salario(),
                       "ms-auth", null);
               authProducer.sendSagaConta(temp);


           } catch (Exception e) {
               LOGGER.info("ERRO: " + e);
           }
       }
   }



}
