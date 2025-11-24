package MSconta.domain.DTOCqrs;

import java.time.Instant;
import java.time.LocalDateTime;

public record SaqueDepositoDTO(int numConta,
                               double saldo,
                               int idMov,
                               Instant dataHora,
                               String tipo,
                               String clienteOrigemNome,
                               String clienteOrigameCpf,
                               String clienteDestinoNome,
                               String clieneDestinoCpf,
                               double valor,
                               String mensagemTipo) {
}
