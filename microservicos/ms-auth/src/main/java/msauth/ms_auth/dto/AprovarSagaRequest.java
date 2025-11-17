package msauth.ms_auth.dto;

public record AprovarSagaRequest(
    String sagaId,
    String email,
    String nome
) {

}
