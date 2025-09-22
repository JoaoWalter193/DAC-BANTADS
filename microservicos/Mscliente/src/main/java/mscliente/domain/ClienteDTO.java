package mscliente.domain;

public record ClienteDTO(String cpf,
                         String nome,
                         String email,
                         double salario,
                         String endereco,
                         String cep,
                         String cidade,
                         String estado) {
}
