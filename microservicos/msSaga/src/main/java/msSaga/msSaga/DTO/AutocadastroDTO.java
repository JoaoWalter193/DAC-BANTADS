package msSaga.msSaga.DTO;

import java.util.UUID;

import msSaga.msSaga.domain.SagaStatus;
import msSaga.msSaga.domain.SagaStep;

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
    String numeroConta,
    Long idGerente
) {

    public AutocadastroDTO mudaEstado(SagaStep novoStep, SagaStatus novoStatus) {
        return new AutocadastroDTO(
            this.sagaId, novoStep, novoStatus, this.mensagemErro,
            this.nome, this.cpf, this.email, this.salario, this.endereco, this.cep, this.cidade, this.estado,
            this.idClienteCriado, this.idAuthCriado, this.numeroConta, this.idGerente
        );
    }
    
    public AutocadastroDTO comErro(SagaStep stepFalha, String erro) {
        return new AutocadastroDTO(
             this.sagaId, stepFalha, SagaStatus.ERRO, erro,
             this.nome, this.cpf, this.email, this.salario, this.endereco, this.cep, this.cidade, this.estado,
             this.idClienteCriado, this.idAuthCriado, this.numeroConta, this.idGerente
        );
    }
}
