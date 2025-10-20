package mscliente.domain;

public record AlteracaoPerfilDTO (

    ClienteDTO dadosOriginais,
    ClienteDTO dadosAtualizados
    
) {
}
