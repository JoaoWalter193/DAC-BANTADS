package msSaga.msSaga.domain;

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
