package MSconta.domain;

import java.time.LocalDate;

public record ContaPadraoDTO(int numConta,
                             String cpfCliente,
                             String nomeCliente,
                             double saldo,
                             double limite,
                             String cpfGerente,
                             String nomeGerente,
                             LocalDate dataCriacao) {
}
