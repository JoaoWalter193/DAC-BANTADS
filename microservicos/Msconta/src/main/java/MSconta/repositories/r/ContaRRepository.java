package MSconta.repositories.r;

import MSconta.domain.ContaR;
import MSconta.domain.GerenteDTO;
import MSconta.domain.GerentesDTOs.GerenteDashDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContaRRepository extends JpaRepository<ContaR, String> {

    Optional<ContaR> findByCpfCliente(String cpf);

    Optional<ContaR> findByNumConta(String numConta);

    boolean existsByNumConta(int numConta);

    @Query("SELECT c FROM contaR c WHERE c.ativa = true ORDER BY c.saldo DESC LIMIT 3")
    List<ContaR> findTop3ByOrderBySaldoDesc();

    @Query("SELECT DISTINCT c.cpfGerente, c.nomeGerente FROM contaR c WHERE c.ativa = true")
    List<GerenteDTO> findCpfsGerentesAtivos();

    // REMOVER GERENTE --> PEGAR TODAS AS CONTAS QUE ELE TEM E JOGAR PARA O QUE TEM MENOS

    List<ContaR> findAllByCpfGerente(String cpfGerente);

    @Query("""
    SELECT new MSconta.domain.GerenteDTO(c.cpfGerente, c.nomeGerente)
    FROM contaR c
    WHERE c.ativa = true
    GROUP BY c.cpfGerente, c.nomeGerente
    ORDER BY COUNT(c) ASC
    """)
    List<GerenteDTO> findGerentesOrdenadosPorQuantidadeDeContas(Pageable pageable);



    //ADD GERENTE --> PEGAR 1 CONTA ATIVA DO QUE TEM MAIS E JOGAR PARA O NOVO

    @Query(value = """
    SELECT *
    FROM dbcontar.conta c
    WHERE c.ativa = true
      AND c.cpfgerente = (
          SELECT c2.cpfgerente
          FROM dbcontar.conta c2
          WHERE c2.ativa = true
          GROUP BY c2.cpfgerente
          ORDER BY COUNT(*) DESC, MIN(c2.saldo) ASC
          LIMIT 1
      )
    LIMIT 1
""", nativeQuery = true)
    Optional<ContaR> findContaAtivaDoGerenteComMaisContas();







}



