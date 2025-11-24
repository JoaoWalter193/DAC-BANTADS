package MSconta.domain.DTOCqrs;

import java.time.Instant;
import java.time.LocalDateTime;


// não vai precisar separar em tipos porque todos eles vão ser só inserções de dados
// já tratdos/criados então tudo que usar isso só vai atualizar as duas coisas
public record TransferenciaDTO(int numConta,
                               double saldo,
                               int idMov,
                               Instant dataHora,
                               String tipo,
                               String clienteOrigemNome,
                               String clienteOrigameCpf,
                               String clienteDestinoNome,
                               String clieneDestinoCpf,
                               double valor,
                               int numConta2,
                               double saldo2,
                               String mensagemTipo) {
}
