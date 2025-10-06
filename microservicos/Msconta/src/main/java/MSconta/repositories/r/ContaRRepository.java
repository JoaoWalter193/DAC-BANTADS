package MSconta.repositories.r;

import MSconta.domain.ContaR;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContaRRepository extends JpaRepository<ContaR, String> {

    Optional<ContaR> findByCpfCliente(String cpf);

    Optional<ContaR> findByNumConta(String numConta);


}



