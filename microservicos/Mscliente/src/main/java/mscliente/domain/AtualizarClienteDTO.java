package mscliente.domain;

public record AtualizarClienteDTO(
                                     String nome,
                                     String email,
                                     Double salario,
                                     String endereco,
                                     String cep,
                                     String cidade,
                                     String estado) {
}
