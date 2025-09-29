package MSconta.domain;

public record AdicionarContaDTO(String cpfCliente,
                                String nomeCLiente,
                                double salario,
                                String cpfGerente,
                                String nomeGerente) {
}
