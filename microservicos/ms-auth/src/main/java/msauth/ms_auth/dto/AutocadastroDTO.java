package msauth.ms_auth.dto;

import java.util.UUID;

public record AutocadastroDTO(
        UUID sagaId,
        SagaStep stepAtual,
        SagaStatus status,
        String mensagemErro,

        String nome,
        String cpf,
        String email,
        String telefone,
        double salario,
        String endereco,
        String cep,
        String cidade,
        String estado,

        String idClienteCriado,
        String idAuthCriado,
        Integer numeroConta,
        Long idGerente) {

    public AutocadastroDTO comAuthCriado(String idAuth) {
        return new AutocadastroDTO(
                this.sagaId, SagaStep.AUTH_CRIADO, SagaStatus.SUCESSO, null,
                this.nome, this.cpf, this.email, this.telefone, this.salario, this.endereco, this.cep, this.cidade,
                this.estado,
                this.idClienteCriado,
                idAuth, // Preenche o id do mongo
                this.numeroConta, this.idGerente);
    }

    public AutocadastroDTO comErro(String erro) {
        return new AutocadastroDTO(
                this.sagaId, this.stepAtual, SagaStatus.ERRO, erro,
                this.nome, this.cpf, this.email, this.telefone, this.salario, this.endereco, this.cep, this.cidade,
                this.estado,
                this.idClienteCriado, this.idAuthCriado, this.numeroConta, this.idGerente);
    }
}
