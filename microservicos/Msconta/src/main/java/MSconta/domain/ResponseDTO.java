package MSconta.domain;

public record ResponseDTO(int cod,
                          String cpfCliente,
                          String nomeCliente,
                          Double salario,
                          String ms) {
}