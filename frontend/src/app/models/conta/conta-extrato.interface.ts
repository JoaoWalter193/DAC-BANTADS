import { Transacao } from './transacao.interface';

export interface ContaExtrato {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  saldoInicial: number;
  movimentacoes: MovimentacaoPorDia[];
}

export interface MovimentacaoPorDia {
  data: Date;
  saldoConsolidado: number;
  transacoes: Transacao[];
}
