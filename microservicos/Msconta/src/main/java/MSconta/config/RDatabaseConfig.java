package MSconta.config;


import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

@Configuration
@EnableJpaRepositories(
        basePackages = "MSconta.repositories.r",
        entityManagerFactoryRef = "rEntityManagerFactory",
        transactionManagerRef = "rTransactionManager"
)
public class RDatabaseConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.r")
    public DataSource rDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "rEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean rEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("rDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("MSconta.domain", "MSconta.domain.movimentacoes")
                .persistenceUnit("r")
                .build();
    }

    @Bean(name = "rTransactionManager")
    public PlatformTransactionManager rTransactionManager(
            @Qualifier("rEntityManagerFactory") EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}
