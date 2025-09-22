package mscliente.domain;

public record ClienteDTO(String cpf,
                         String nome,
                         String email,
                         String endereco,
                         String cidade,
                         String estado) {
}
