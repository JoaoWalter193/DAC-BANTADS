package mscliente.domain;

public enum SagaStatus {
    SUCESSO,
    ERRO,
    ROLLBACK_PENDENTE,
    FALHA_CRITICA
}
