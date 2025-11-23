package msauth.ms_auth.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.saga}")
    private String sagaExchange;

    @Value("${rabbitmq.queue.auth-create}")
    private String authCreateQueue;

    @Value("${rabbitmq.key.auth-create}")
    private String authCreateKey;

    @Value("${rabbitmq.queue.auth-approve}")
    private String authApproveQueue;

    @Value("${rabbitmq.key.auth-approve}")
    private String authApproveKey;

    @Value("${rabbitmq.queue.auth-rollback}")
    private String authRollbackQueue;

    @Value("${rabbitmq.key.auth-rollback}")
    private String authRollbackKey;


    @Bean
    public TopicExchange sagaExchange() {
        return new TopicExchange(sagaExchange);
    }

    @Bean
    public Queue authCreateQueue() {
        return new Queue(authCreateQueue);
    }

    @Bean
    public Queue authApproveQueue() {
        return new Queue(authApproveQueue);
    }

    @Bean
    public Queue authRollbackQueue() {
        return new Queue(authRollbackQueue);
    }


    @Bean
    public Binding bindingAuthCreate(Queue authCreateQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(authCreateQueue)
                .to(sagaExchange)
                .with(authCreateKey);
    }

    @Bean
    public Binding bindingAuthApprove(Queue authApproveQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(authApproveQueue)
                .to(sagaExchange)
                .with(authApproveKey);
    }

    @Bean
    public Binding bindingAuthRollback(Queue authRollbackQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(authRollbackQueue)
                .to(sagaExchange)
                .with(authRollbackKey);
    }


    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            SimpleRabbitListenerContainerFactoryConfigurer configurer) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        configurer.configure(factory, connectionFactory);
        factory.setMessageConverter(converter());
        return factory;
    }
}