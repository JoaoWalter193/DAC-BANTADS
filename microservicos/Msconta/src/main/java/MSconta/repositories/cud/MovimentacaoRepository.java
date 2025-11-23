package MSconta.repositories.cud;

import MSconta.domain.movimentacoes.Movimentacoes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoRepository extends JpaRepository<Movimentacoes, Integer> {

    List<Movimentacoes> findByClienteOrigemCpf(String cpf);


}
