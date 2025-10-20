package mscliente.config;


import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String SAGA_EXCHANGE = "saga-exchange";

    // --- FILAS DE COMANDOS (que o ms-cliente OUVE) ---
    public static final String CLIENTE_ATUALIZAR_CMD_QUEUE = "cliente-atualizar-cmd-queue";
    public static final String CLIENTE_COMPENSAR_CMD_QUEUE = "cliente-compensar-cmd-queue";

    // --- Declaração das filas ---
    @Bean
    public Queue clienteAtualizarCmdQueue() { return new Queue(CLIENTE_ATUALIZAR_CMD_QUEUE); }
    @Bean
    public Queue clienteCompensarCmdQueue() { return new Queue(CLIENTE_COMPENSAR_CMD_QUEUE); }

    // --- Exchange (a mesma do ms-saga) ---
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(SAGA_EXCHANGE);
    }

    //
    // atualização e compensação
    //
    // --- Ligações (Bindings) para as filas de COMANDO ---
    // Liga a fila 'cliente-atualizar-cmd-queue' à exchange com a chave 'cliente.atualizar.cmd'
    @Bean
    public Binding bindClienteAtualizar(TopicExchange exchange, Queue clienteAtualizarCmdQueue) {
        return BindingBuilder.bind(clienteAtualizarCmdQueue).to(exchange).with("cliente.atualizar.cmd");
    }
    @Bean
    public Binding bindClienteCompensar(TopicExchange exchange, Queue clienteCompensarCmdQueue) {
        return BindingBuilder.bind(clienteCompensarCmdQueue).to(exchange).with("cliente.compensar.cmd");
    }

    // --- Configuração do Conversor de Mensagens (para JSON) ---
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
