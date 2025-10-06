package MSconta.domain.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SaqueDepositoDTO(int numConta,
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
                               String mensagemTipo) {
}
