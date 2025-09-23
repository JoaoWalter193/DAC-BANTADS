package msauth.ms_auth.config;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQConnectionTest {

    private final ConnectionFactory connectionFactory;

    public RabbitMQConnectionTest(ConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void testConnection() {
        try {
            var connection = connectionFactory.createConnection();
            System.out.println("✅ Conexão com RabbitMQ estabelecida com sucesso! -- MS AUTH");
            System.out.println("✅ Host: " + connectionFactory.getHost());
            System.out.println("✅ Port: " + connectionFactory.getPort());
            connection.close();
        } catch (Exception e) {
            System.err.println("❌ Erro ao conectar com RabbitMQ: " + e.getMessage());
        }
    }
}