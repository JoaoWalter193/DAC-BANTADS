import { Transacao } from "./transacao.interface";

export interface ContaExtrato {
  conta: string;
  saldo: number;
  movimentacoes: Transacao[];
}