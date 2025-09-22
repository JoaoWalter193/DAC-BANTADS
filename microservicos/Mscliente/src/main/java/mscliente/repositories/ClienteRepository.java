package mscliente.repositories;

import mscliente.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, String> {

    List<Cliente> findByStatus(String status);

    Optional<Cliente> findByCpf(String cpf);

}
