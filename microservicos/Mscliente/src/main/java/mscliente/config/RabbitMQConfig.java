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
    public TopicExchange exchange(){
        return new TopicExchange(exchange);
    }

// teste pedro alteracaoperfil
// fila pra atualizar o ms-cliente
    @Value("AtualizarCliente")
    private String filaAtualizarCliente;
    @Bean
    public Queue filaAtualizarCliente() {
        return new Queue(filaAtualizarCliente);
    }

// key
    @Value("keyAtualizarCliente")
    private String routingKeyAtualizarCliente;

// binding
    @Bean
    public Binding bindingAtualizarCliente() {
        return BindingBuilder
                .bind(filaAtualizarCliente())
                .to(exchange())
                .with(routingKeyAtualizarCliente);
    }

// falha, reverter
    @Value("AtualizarClienteFalha")
    private String filaAtualizarClienteFalha;
    @Bean
    public Queue filaAtualizarClienteFalha() {
        return new Queue(filaAtualizarClienteFalha);
    }

    // Key
    @Value("keyAtualizarClienteFalha")
    private String routingKeyAtualizarClienteFalha;

    // Binding
    @Bean
    public Binding bindingAtualizarClienteFalha() {
        return BindingBuilder
                .bind(filaAtualizarClienteFalha())
                .to(exchange())
                .with(routingKeyAtualizarClienteFalha);
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
