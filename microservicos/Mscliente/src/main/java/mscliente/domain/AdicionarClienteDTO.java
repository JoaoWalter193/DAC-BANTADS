package mscliente.domain;

public record AdicionarClienteDTO(
        String cpf,
        String nome,
        String email,
        String senha,
        Double salario,
        String endereco,
        String cep,
        String cidade,
        String estado
) {
}
