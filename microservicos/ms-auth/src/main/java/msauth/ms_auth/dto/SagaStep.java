package msauth.ms_auth.dto;

public enum SagaStep {
    INICIO,
    CLIENTE_CRIADO,
    AUTH_CRIADO,
    CONTA_CRIADA,
    GERENTE_VINCULADO,

    CLIENTE_FALHA,
    AUTH_FALHA,
    CONTA_FALHA,
    GERENTE_FALHA
}
