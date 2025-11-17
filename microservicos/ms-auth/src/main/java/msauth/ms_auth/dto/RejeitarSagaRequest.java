package msauth.ms_auth.dto;

public record RejeitarSagaRequest(
    String sagaId,
    String email,
    String nome,
    String motivo
) {}
