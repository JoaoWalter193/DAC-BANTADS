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

/**
 * As filas definidas aqui são para CONSUMO de comandos vindos do orquestrador
 * da Saga (ex: saga.auth.create, saga.auth.compensate).
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.saga}")
    private String sagaExchange;
    

    @Value("${rabbitmq.queue.auth-create}")
    private String authCreateQueue;

    @Value("${rabbitmq.key.auth-create}")
    private String authCreateKey;

    
    @Value("${rabbitmq.queue.auth-reject}")
    private String authRejectQueue;

    @Value("${rabbitmq.key.auth-reject}")
    private String authRejectKey;
    
    
    @Value("${rabbitmq.queue.auth-approve}")
    private String authApproveQueue;

    @Value("${rabbitmq.key.auth-approve}")
    private String authApproveKey;


    @Value("${rabbitmq.queue.auth-compensate}")
    private String authCompensateQueue;

    @Value("${rabbitmq.key.auth-compensate}")
    private String authCompensateKey;


    /**
     * Define o conversor de mensagens padrão como Jackson2JsonMessageConverter.
     * Isso garante que os objetos Java sejam serializados/desserializados
     * de/para JSON automaticamente.
     */
    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
    
    /**
     * Cria um template (AmqpTemplate) para PUBLICAÇÃO de mensagens.
     * Este template é configurado para usar o MessageConverter (JSON) definido acima.
     * Será usado para enviar respostas/eventos de volta para a Saga.
     */
    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }

    /**
     * Define a exchange principal (Topic) por onde todos os eventos
     * da SAGA são roteados.
     */
    @Bean
    public TopicExchange sagaExchange() {
        return new TopicExchange(sagaExchange);
    }

    // --- Definição das Filas (Queues) ---

    /**
     * Fila para consumir comandos de CRIAÇÃO PENDENTE de usuários
     * no ms-auth, vindos do ms-saga.
     * Payload esperado: AutocadastroSagaRequest
     */
    @Bean
    public Queue authCreateQueue() {
        return new Queue(authCreateQueue);
    }

    /**
     * Fila para consumir comandos de APROVAÇÃO de usuários
     * no ms-auth.
     * Payload esperado: AprovarSagaRequest
     */
    @Bean
    public Queue authApproveQueue() {
        return new Queue(authApproveQueue);
    }

    /**
     * Fila para consumir comandos de REJEIÇÃO de usuários
     * no ms-auth.
     * Payload esperado: RejeitarSagaRequest
     */
    @Bean
    public Queue authRejectQueue() {
        return new Queue(authRejectQueue);
    }

    /**
     * Fila para consumir comandos de COMPENSAÇÃO (rollback)
     * no ms-auth.
     * Payload esperado: CompensarSagaRequest
     */
    @Bean
    public Queue authCompensateQueue() {
        return new Queue(authCompensateQueue);
    }

    // --- Definição das Ligações (Bindings) ---

    /**
     * Liga a fila de criação de usuário (authCreateQueue) à exchange
     * principal (sagaExchange) usando a chave de roteamento (authCreateKey).
     */
    @Bean
    public Binding authCreateBinding(Queue authCreateQueue, TopicExchange sagaExchange) {
        return BindingBuilder
                .bind(authCreateQueue)
                .to(sagaExchange)
                .with(authCreateKey);
    }

    /**
     * Liga a fila de aprovação do usuário (authApproveQueue) à exchange
     * principal (sagaExchange) usando a chave de roteamento (authApproveQueue).
     */
    @Bean
    public Binding authApproveBinding(Queue authApproveQueue, TopicExchange sagaExchange) {
        return BindingBuilder
                .bind(authApproveQueue)
                .to(sagaExchange)
                .with(authApproveKey);
    }

    /**
     * Liga a fila de rejeição de usuário (authRejectQueue) à exchange
     * principal (sagaExchange) usando a chave de roteamento (authRejectQueue).
     */
    @Bean
    public Binding authRejectBinding(Queue authRejectQueue, TopicExchange sagaExchange) {

        return BindingBuilder
                .bind(authRejectQueue)
                .to(sagaExchange)
                .with(authRejectKey);
    }

    /**
     * Liga a fila de compensação (authCompensateQueue) à exchange
     * principal (sagaExchange) usando a chave de roteamento (authCompensateKey).
     */
    @Bean
    public Binding authCompensateBinding(Queue authCompensateQueue, TopicExchange sagaExchange) {
        return BindingBuilder
                .bind(authCompensateQueue)
                .to(sagaExchange)
                .with(authCompensateKey);
    }

    /**
     * Configura a "fábrica" de listeners (consumidores @RabbitListener).
     * Garante que os consumidores também utilizem o MessageConverter (JSON)
     * para desserializar as mensagens recebidas.
     */
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
