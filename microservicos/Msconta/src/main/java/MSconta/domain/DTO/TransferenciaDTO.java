package MSconta.domain.DTO;

import MSconta.domain.ContaCUD;
import MSconta.domain.ContaR;
import MSconta.domain.movimentacoes.Movimentacoes;
import MSconta.domain.movimentacoes.MovimentacoesR;

import java.time.LocalDate;
import java.time.LocalDateTime;


// não vai precisar separar em tipos porque todos eles vão ser só inserções de dados
// já tratdos/criados então tudo que usar isso só vai atualizar as duas coisas
public record TransferenciaDTO(int numConta,
                               String cpfCliente,
                               String nomeCliente,
                               double saldo,
                               double limite,
                               String cpfGerente,
                               String nomeGerente,
                               LocalDate dataCriacao,
                               int idMov,
                               LocalDateTime dataHora,
                               String tipo,
                               String clienteOrigemNome,
                               String clienteOrigameCpf,
                               String clienteDestinoNome,
                               String clieneDestinoCpf,
                               double valor,
                               int numConta2,
                               String cpfCliente2,
                               String nomeCliente2,
                               double saldo2,
                               double limite2,
                               String cpfGerente2,
                               String nomeGerente2,
                               LocalDate dataCriacao2) {
}
