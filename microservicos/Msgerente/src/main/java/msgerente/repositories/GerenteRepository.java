package msgerente.repositories;

import msgerente.domain.Gerente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

public interface GerenteRepository extends JpaRepository<Gerente, String> {
    List<Gerente> findByTipo(String tipo);
    Gerente findByCpf(String cpf);
}
