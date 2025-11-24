package mscliente.repositories;

import mscliente.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, String> {

    List<Cliente> findByStatus(String status);

    List<Cliente> findByStatusNot(String status);

    Optional<Cliente> findByCpfAndStatusNot(String cpf, String status);

    Optional<Cliente> findByEmail(String email);


}
