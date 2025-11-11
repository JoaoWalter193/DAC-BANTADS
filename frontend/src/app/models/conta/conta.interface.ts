import { Transacao } from './transacao.interface';

export interface Conta {
  numeroConta: string;
  saldo: number;
  limite: number;

  nomeGerente?: string;

  cliente: {
    cpf: string;
    nome: string;
    email?: string;
    salario?: number;
    telefone?: string;
    status?: string;
    senha?: string;
    conta?: string;
  };

  dataCriacao?: string;
  transacoes: Transacao[];
}
