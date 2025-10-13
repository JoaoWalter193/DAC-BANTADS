package mscliente.domain;

public record AdicionarClienteDTO(
        String cpf,
        String nome,
        String email,
        Double salario,
        String endereco,
        String cep,
        String cidade,
        String estado,
        String senha
) {
}
