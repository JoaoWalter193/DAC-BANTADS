package MSconta.domain;

public record AdicionarContaDTO(String cpfCliente,
                                String nomeCliente,
                                double salario,
                                String cpfGerente,
                                String nomeGerente) {
}
