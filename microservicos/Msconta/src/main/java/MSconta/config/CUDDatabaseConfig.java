package MSconta.config;


import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

@Configuration
@EnableJpaRepositories(
        basePackages = "MSconta.repositories.cud",
        entityManagerFactoryRef = "cudEntityManagerFactory",
        transactionManagerRef = "cudTransactionManager"
)
public class CUDDatabaseConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.cud")
    public DataSource cudDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "cudEntityManagerFactory")
    @Primary
    public LocalContainerEntityManagerFactoryBean cudEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("cudDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("MSconta.domain", "MSconta.domain.movimentacoes")
                .persistenceUnit("cud")
                .build();
    }

    @Bean(name = "cudTransactionManager")
    @Primary
    public PlatformTransactionManager cudTransactionManager(
            @Qualifier("cudEntityManagerFactory") EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}
