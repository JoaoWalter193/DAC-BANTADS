import { Transacao } from './transacao.interface';

export interface  Conta {
  numeroConta: string;
  saldo: number;
  limite: number;
  dataCriacao?: string;
  transacoes: Transacao[];
}
