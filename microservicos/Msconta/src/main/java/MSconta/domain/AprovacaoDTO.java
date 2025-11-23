package MSconta.domain;

import java.util.UUID;

public record AprovacaoDTO(
        UUID sagaId,
        String cpf,
        String nome,
        String stepAtual,
        String status,
        String mensagemErro,
        double salario,
        String email
    ) {

    public AprovacaoDTO comContaCriada() {
        return new AprovacaoDTO(this.sagaId, this.cpf, this.nome, "CONTA_ATIVADA", "SUCESSO", null, this.salario, this.email);
    }

    public AprovacaoDTO comClienteAprovado() {
        return new AprovacaoDTO(this.sagaId, this.cpf, this.nome, "CLIENTE_APROVADO", "SUCESSO", null, this.salario, this.email);
    }

    public AprovacaoDTO comErro(String erro) {
        return new AprovacaoDTO(this.sagaId, this.cpf, this.nome, this.stepAtual, "ERRO", erro, this.salario, this.email);
    }
}
