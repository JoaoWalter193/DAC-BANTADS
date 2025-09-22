import { Transacao } from './transacao.interface';

export interface ExtratoDia {
  data: Date;
  transacoes: Transacao[];
  saldoConsolidado: number;
}
