package msauth.ms_auth.dto;

public record ResponseDTO(
    int cod,
    String cpf,
    String nome,
    Double salario,
    String ms,
    String senha,
    String email
) {
}
