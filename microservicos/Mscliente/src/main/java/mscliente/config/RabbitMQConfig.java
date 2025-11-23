package mscliente.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class RabbitMQConfig {

    @Value("exchangePrincipal")
    private String exchange;

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Queue queueClienteCriar() {
        return new Queue("queue-cliente-criar");
    }

    @Bean
    public Binding bindingClienteCriar() {
        return BindingBuilder.bind(queueClienteCriar()).to(exchange()).with("keyCliente-criar");
    }


    @Bean
    public Queue queueClienteRollback() {
        return new Queue("queue-cliente-rollback");
    }

    @Bean
    public Binding bindingClienteRollback() {
        return BindingBuilder.bind(queueClienteRollback()).to(exchange()).with("keyCliente-rollback");
    }

    @Value("AtualizarCliente")
    private String filaAtualizarCliente;

    @Bean
    public Queue filaAtualizarCliente() {
        return new Queue(filaAtualizarCliente);
    }


    @Value("keyAtualizarCliente")
    private String routingKeyAtualizarCliente;

    @Bean
    public Binding bindingAtualizarCliente() {
        return BindingBuilder
                .bind(filaAtualizarCliente())
                .to(exchange())
                .with(routingKeyAtualizarCliente);
    }


    @Value("AtualizarClienteFalha")
    private String filaAtualizarClienteFalha;

    @Bean
    public Queue filaAtualizarClienteFalha() {
        return new Queue(filaAtualizarClienteFalha);
    }


    @Value("keyAtualizarClienteFalha")
    private String routingKeyAtualizarClienteFalha;


    @Bean
    public Binding bindingAtualizarClienteFalha() {
        return BindingBuilder
                .bind(filaAtualizarClienteFalha())
                .to(exchange())
                .with(routingKeyAtualizarClienteFalha);
    }

    public static final String QUEUE_CLIENTE_APROVAR = "queue-cliente-aprovar";

    @Bean
    public Queue queueClienteAprovar() {
        return new Queue(QUEUE_CLIENTE_APROVAR);
    }

    @Bean
    public Binding bindingClienteAprovar(Queue queueClienteAprovar, TopicExchange exchangePrincipal) {
        return BindingBuilder.bind(queueClienteAprovar)
                .to(exchangePrincipal)
                .with("cliente-aprovar");
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter(new ObjectMapper());
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }
}