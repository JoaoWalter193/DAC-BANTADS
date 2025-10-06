package MSconta.domain.DTO;

import java.time.LocalDate;

public record AtualizarDTO(int numConta,
                           String cpfCliente,
                           String nomeCliente,
                           double saldo,
                           double limite,
                           String cpfGerente,
                           String nomeGerente,
                           LocalDate dataCriacao,
                           String mensagemTipo) {
}
