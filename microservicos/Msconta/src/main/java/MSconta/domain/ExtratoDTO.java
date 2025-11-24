package MSconta.domain;

import MSconta.domain.movimentacoes.Movimentacoes;

import java.util.List;

public record ExtratoDTO(int conta,
                         double saldo,
                         List<Movimentacoes> movimentacoes) {
}
