import { Transacao } from "./transacao.interface";

export interface Conta {
  numeroConta: string;
  saldo: number;
  limite: number;

  cliente: {
    cpf: string;
    nome: string;
  };

  transacoes: Transacao[];
}
