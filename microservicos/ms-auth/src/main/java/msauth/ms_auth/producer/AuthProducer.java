package msauth.ms_auth.producer;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthProducer {

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.routingkey.auth.event}")
    private String authRoutingKey;

    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public AuthProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publicarUsuarioCriado(UsuarioCriadoDTO dto) {
        System.out.println("Publicando evento de Usuário Criado para o email: " + dto.email());
        rabbitTemplate.convertAndSend(exchange, authRoutingKey, dto);
    }

}
