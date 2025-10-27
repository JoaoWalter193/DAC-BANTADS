package MSconta.config;


import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("exchangePrincipal")
    private String exchange;

    @Bean
    public TopicExchange exchange(){ 
        return new TopicExchange(exchange);
    }


// fila pra atualizar o limite da conta
    @Value("AtualizarLimiteConta")
    private String filaAtualizarLimiteConta;
    @Bean
    public Queue filaAtualizarLimiteConta() {
        return new Queue(filaAtualizarLimiteConta);
    }

// key
    @Value("keyAtualizarLimiteConta")
    private String routingKeyAtualizarLimiteConta;

// binding
    @Bean
    public Binding bindingAtualizarLimiteConta() {
        return BindingBuilder
                .bind(filaAtualizarLimiteConta()) 
                .to(exchange())
                .with(routingKeyAtualizarLimiteConta);
    }


    
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
