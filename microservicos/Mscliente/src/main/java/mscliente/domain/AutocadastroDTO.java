package mscliente.domain;

import java.util.UUID;


public record AutocadastroDTO(

    UUID sagaId,
    SagaStep stepAtual,
    SagaStatus status,
    String mensagemErro,

    // --- Dados de Entrada (Formulário) ---
    String cpf,
    String email,
    String nome,
    double salario,
    String endereco,
    String cep,
    String cidade,
    String estado,

    String idClienteCriado,
    String idAuthCriado,
    Integer numeroConta,
    Long idGerente
) {

    public AutocadastroDTO comClienteCriado(String idCliente) {
        return new AutocadastroDTO(
            this.sagaId, SagaStep.CLIENTE_CRIADO, SagaStatus.SUCESSO, null,
            this.nome, this.cpf, this.email, this.salario, this.endereco, this.cep, this.cidade, this.estado,
            idCliente, this.idAuthCriado, this.numeroConta, this.idGerente
        );
    }
    
    // Método para registrar erro
    public AutocadastroDTO comErro(String erro) {
        return new AutocadastroDTO(
             this.sagaId, this.stepAtual, SagaStatus.ERRO, erro,
             this.nome, this.cpf, this.email, this.salario, this.endereco, this.cep, this.cidade, this.estado,
             this.idClienteCriado, this.idAuthCriado, this.numeroConta, this.idGerente
        );
    }
}


