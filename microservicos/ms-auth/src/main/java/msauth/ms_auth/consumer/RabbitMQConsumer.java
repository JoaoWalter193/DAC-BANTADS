package msauth.ms_auth.consumer;

import msauth.ms_auth.dto.AprovacaoDTO;
import msauth.ms_auth.dto.AutocadastroDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import msauth.ms_auth.service.AuthService;
import msauth.ms_auth.producer.AuthProducer;

@Component
public class RabbitMQConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    private final AuthService authService;
    private final AuthProducer authProducer;

    public RabbitMQConsumer(AuthService authService, AuthProducer authProducer) {
        this.authService = authService;
        this.authProducer = authProducer;
    }

    @RabbitListener(queues = "${rabbitmq.queue.auth-approve}")
    public void processarCriacaoAuth(AprovacaoDTO saga) {
        System.out.println("MS-AUTH: Recebido comando de criação de usuário para: " + saga.email());

        try {
            authService.criarUsuarioAprovado(saga);

            AprovacaoDTO resposta = new AprovacaoDTO(
                    saga.sagaId(),
                    saga.cpf(),
                    saga.nome(),
                    "AUTH_CRIADO",
                    "SUCESSO",
                    null,
                    saga.salario(),
                    saga.email());

            authProducer.enviarRespostaSaga(resposta);

        } catch (Exception e) {
            e.printStackTrace();
            AprovacaoDTO erro = new AprovacaoDTO(
                    saga.sagaId(), saga.cpf(), saga.nome(),
                    "AUTH_ERRO", "FALHA", e.getMessage(), saga.salario(), saga.email());
            authProducer.enviarRespostaSaga(erro);
        }
    }

    @RabbitListener(queues = "${rabbitmq.queue.auth-rollback}")
    public void processarRollbackAuth(AutocadastroDTO saga) {
        LOGGER.info("MS-AUTH: Recebido comando de ROLLBACK para Saga ID: {}", saga.sagaId());
        authService.executarSagaRollback(saga);
    }
}