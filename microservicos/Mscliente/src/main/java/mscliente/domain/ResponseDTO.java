package mscliente.domain;

public record ResponseDTO(int cod,
                          String cpf,
                          String nome,
                          Double salario,
                          String ms) {
}
