package msSaga.msSaga.Config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// File para criar as queues, as exchanges e os bindings

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.saga}")
    private String exchangeName;

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }

    @Value("${rabbitmq.queue.saga-response}")
    private String queueSagaResposta;

    @Value("${rabbitmq.key.saga-response}")
    private String keySagaResposta;

    @Bean
    public Queue queueSagaResposta() {
        return new Queue(queueSagaResposta, true);
    }

    @Bean
    public Binding bindingSagaResposta() {
        return BindingBuilder.bind(queueSagaResposta()).to(exchange()).with(keySagaResposta);
    }

    @Value("${rabbitmq.queue.cliente}")
    private String queueCliente;
    @Value("${rabbitmq.key.cliente}")
    private String keyCliente;

    @Bean
    public Queue queueCliente() {
        return new Queue(queueCliente);
    }

    @Bean
    public Binding bindingCliente() {
        return BindingBuilder.bind(queueCliente()).to(exchange()).with(keyCliente);
    }

    @Value("${rabbitmq.queue.auth}")
    private String queueAuth;
    @Value("${rabbitmq.key.auth}")
    private String keyAuth;

    @Bean
    public Queue queueAuth() {
        return new Queue(queueAuth);
    }

    @Bean
    public Binding bindingAuth() {
        return BindingBuilder.bind(queueAuth()).to(exchange()).with(keyAuth);
    }

    @Value("${rabbitmq.queue.conta}")
    private String queueConta;
    @Value("${rabbitmq.key.conta}")
    private String keyConta;

    @Bean
    public Queue queueConta() {
        return new Queue(queueConta);
    }

    @Bean
    public Binding bindingConta() {
        return BindingBuilder.bind(queueConta()).to(exchange()).with(keyConta);
    }

    @Value("${rabbitmq.queue.atualizacao-cliente-sucesso}")
    private String queueAttClienteSucesso;
    @Value("${rabbitmq.key.atualizacao-cliente-sucesso}")
    private String keyAttClienteSucesso;

    @Bean
    public Queue queueAttClienteSucesso() {
        return new Queue(queueAttClienteSucesso);
    }

    @Bean
    public Binding bindingAttClienteSucesso() {
        return BindingBuilder.bind(queueAttClienteSucesso()).to(exchange()).with(keyAttClienteSucesso);
    }

    @Value("${rabbitmq.queue.atualizacao-conta-sucesso}")
    private String queueAttContaSucesso;
    @Value("${rabbitmq.key.atualizacao-conta-sucesso}")
    private String keyAttContaSucesso;

    @Bean
    public Queue queueAttContaSucesso() {
        return new Queue(queueAttContaSucesso);
    }

    @Bean
    public Binding bindingAttContaSucesso() {
        return BindingBuilder.bind(queueAttContaSucesso()).to(exchange()).with(keyAttContaSucesso);
    }

    @Value("${rabbitmq.queue.atualizacao-conta-falha}")
    private String queueAttContaFalha;
    @Value("${rabbitmq.key.atualizacao-conta-falha}")
    private String keyAttContaFalha;

    @Bean
    public Queue queueAttContaFalha() {
        return new Queue(queueAttContaFalha);
    }

    @Bean
    public Binding bindingAttContaFalha() {
        return BindingBuilder.bind(queueAttContaFalha()).to(exchange()).with(keyAttContaFalha);
    }

    @Bean
    public MessageConverter converter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }
}
