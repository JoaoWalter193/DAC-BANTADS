package MSconta.domain;


public record AutocadastroDTO(String cpf,
                              String email,
                              String nome,
                              double salario,
                              String endereco,
                              String cep,
                              String cidade,
                              String estado) {
}
