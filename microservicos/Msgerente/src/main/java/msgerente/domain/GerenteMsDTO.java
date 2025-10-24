package msgerente.domain;

public record GerenteMsDTO(String cpf,
                           String nome,
                           String email,
                           String tipo,
                           String senha,
                           String acao) {
}
