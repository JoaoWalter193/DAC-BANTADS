package MSconta.repositories;

import MSconta.domain.ContaCUD;
import MSconta.domain.ContaR;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContaRRepository extends JpaRepository<ContaR, String> {

    Optional<ContaCUD> findByCpfCliente(String cpf);

    Optional<ContaCUD> findByNumConta(String numConta);


}



