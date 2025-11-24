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


// fila pra atualizar o limite da origem
    @Value("AtualizarConta")
    private String filaAtualizarConta;
    @Bean
    public Queue filaAtualizarConta() {
        return new Queue(filaAtualizarConta);
    }

// key
    @Value("keyAtualizarConta")
    private String routingKeyAtualizarConta;

// binding
    @Bean
    public Binding bindingAtualizarConta() {
        return BindingBuilder
                .bind(filaAtualizarConta()) 
                .to(exchange())
                .with(routingKeyAtualizarConta);
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
