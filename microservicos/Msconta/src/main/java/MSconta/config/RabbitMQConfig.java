package MSconta.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class RabbitMQConfig {


    @Value("exchangePrincipal")
    private String exchange;

    public static final String ROUTING_KEY_CONTA_CRIAR = "conta-criar";
    public static final String ROUTING_KEY_CONTA_ROLLBACK = "conta-rollback";
    public static final String ROUTING_KEY_ATUALIZAR_CONTA = "keyAtualizarConta";

    public static final String QUEUE_CONTA_CRIAR = "queue-conta-criar";
    public static final String QUEUE_CONTA_ROLLBACK = "queue-conta-rollback";
    public static final String QUEUE_ATUALIZAR_CONTA = "AtualizarConta";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Queue queueContaCriar() {
        return new Queue(QUEUE_CONTA_CRIAR);
    }

    @Bean
    public Binding bindingContaCriar() {
        return BindingBuilder.bind(queueContaCriar())
                .to(exchange())
                .with(ROUTING_KEY_CONTA_CRIAR); 
    }

    @Bean
    public Queue queueContaRollback() {
        return new Queue(QUEUE_CONTA_ROLLBACK, true);
    }

    @Bean
    public Binding bindingContaRollback() {
        return BindingBuilder.bind(queueContaRollback())
                .to(exchange())
                .with(ROUTING_KEY_CONTA_ROLLBACK);
    }

    @Bean
    public Queue filaAtualizarConta() {
        return new Queue(QUEUE_ATUALIZAR_CONTA, true);
    }

    @Bean
    public Binding bindingAtualizarConta() {
        return BindingBuilder.bind(filaAtualizarConta())
                .to(exchange())
                .with(ROUTING_KEY_ATUALIZAR_CONTA);
    }


    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}