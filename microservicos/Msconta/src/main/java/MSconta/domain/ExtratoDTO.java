package MSconta.domain;

import MSconta.domain.movimentacoes.Movimentacoes;

import java.util.List;

public record ExtratoDTO(int numConta,
                         double saldo,
                         List<Movimentacoes> movimentacoes) {
}
