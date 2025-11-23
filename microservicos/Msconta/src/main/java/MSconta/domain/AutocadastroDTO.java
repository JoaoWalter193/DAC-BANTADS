package MSconta.domain;

import java.util.UUID;


public record AutocadastroDTO(

    UUID sagaId,
    SagaStep stepAtual,
    SagaStatus status,
    String mensagemErro,
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

    public AutocadastroDTO comContaCriada(Integer numeroConta, Long idGerente) {
        return new AutocadastroDTO(
            this.sagaId, SagaStep.CONTA_CRIADA, SagaStatus.SUCESSO, null,
            this.nome, this.cpf, this.email, this.salario, this.endereco, this.cep, this.cidade, this.estado,
            this.idClienteCriado, this.idAuthCriado, 
            numeroConta,
            idGerente
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



