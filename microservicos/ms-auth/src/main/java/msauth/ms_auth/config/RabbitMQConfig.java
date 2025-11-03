package msauth.ms_auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

// Produtor e consumidor
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.saga}")
    private String sagaExchange;

    @Value("${rabbitmq.queue.auth-create}")
    private String authCreateQueue;

    @Value("${rabbitmq.key.saga-create-auth}")
    private String sagaCreateAuthKey;

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
    public TopicExchange sagaExchange() {
        return new TopicExchange(sagaExchange);
    }

    @Bean
    public Binding authCreateBinding(Queue authCreateQueue, TopicExchange sagaExchange) {
        return BindingBuilder
                .bind(authCreateQueue)
                .to(sagaExchange)
                .with(sagaCreateAuthKey);
    }

    @Bean
    public Queue authCreateQueue() {
        return new Queue(authCreateQueue);
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
