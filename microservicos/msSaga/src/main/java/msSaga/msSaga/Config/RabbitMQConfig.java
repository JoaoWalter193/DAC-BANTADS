package msSaga.msSaga.Config;


import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.json.JsonMapper;

// File para criar as queues, as exchanges e os bindings


@Configuration
public class RabbitMQConfig {

// Criação da Exchange, vai ter uma só

    @Value("exchangePrincipal")
    private String exchange;


    @Bean
    public TopicExchange exchange(){
        return new TopicExchange(exchange);
    }

    // Criação das Queues, Keys e Bindings

    //Queue
    @Value("MsAuth")
    private String queueMsAuth;
    @Bean
    public Queue queueAuth(){ return new Queue(queueMsAuth);}

    //Key
    @Value("keyAuth")
    private String routingKeyAuth;

    //Binding da Queue
    @Bean
    public Binding bindingAuth(){
        return BindingBuilder.bind(queueAuth())
                .to(exchange())
                .with(routingKeyAuth);
    }

    //Queue
    @Value("MsSaga")
    private String queueMsSaga;
    @Bean
    public Queue queueSaga(){ return new Queue(queueMsSaga);}

    //Key
    @Value("keySaga")
    private String routingKeySaga;

    //Binding da Queue
    @Bean
    public Binding bindingSaga(){
        return BindingBuilder.bind(queueSaga())
                .to(exchange())
                .with(routingKeySaga);
    }




    //Queue
    @Value("MsCliente")
    private String queueMsCliente;
    @Bean
    public Queue queueCliente(){ return new Queue(queueMsCliente);}

    //Key
    @Value("keyCliente")
    private String routingKeyCliente;

    //Binding da Queue
    @Bean
    public Binding bindingCliente(){
        return BindingBuilder.bind(queueCliente())
                .to(exchange())
                .with(routingKeyCliente);
    }


    //Queue
    @Value("MsGerente")
    private String queueMsGerente;
    @Bean
    public Queue queueGerente(){ return new Queue(queueMsGerente);}

    //Key
    @Value("keyGerente")
    private String routingKeyGerente;

    //Binding da Queue
    @Bean
    public Binding bindingGerente(){
        return BindingBuilder.bind(queueGerente())
                .to(exchange())
                .with(routingKeyGerente);
    }

    //Queue
    @Value("MsConta")
    private String queueMsConta;
    @Bean
    public Queue queueConta(){ return new Queue(queueMsConta);}

    //Key
    @Value("keyConta")
    private String routingKeyConta;

    //Binding da Queue
    @Bean
    public Binding bindingConta(){
        return BindingBuilder.bind(queueConta())
                .to(exchange())
                .with(routingKeyConta);
    }

    //Queue
    @Value("BancoAtt")
    private String queueBancoAtt;
    @Bean
    public Queue queueBanco(){ return new Queue(queueBancoAtt);}

    //Key
    @Value("keyBanco")
    private String routingKeyBanco;

    //Binding da Queue
    @Bean
    public Binding bindingBanco(){
        return BindingBuilder.bind(queueBanco())
                .to(exchange())
                .with(routingKeyBanco);
    }



    // para fazer com que ele envie classes e coisas com JSON parser
    @Bean
    public MessageConverter converter(){
        return new JacksonJsonMessageConverter();
    }
    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory){
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }





}
