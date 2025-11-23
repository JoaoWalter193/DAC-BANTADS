package MSconta.repositories.cud;

import MSconta.domain.ContaCUD;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContaCUDRepository extends JpaRepository<ContaCUD, Integer> {
    Optional<ContaCUD> findByCpfCliente(String cpfCliente);
}
