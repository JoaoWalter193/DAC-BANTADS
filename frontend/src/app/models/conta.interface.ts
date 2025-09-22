import { Cliente } from './cliente.interface';
import { Transacao } from './transacao.interface';

export interface Conta {
  cliente: Cliente;
  numeroConta: string;
  dataCriacao: string;
  saldo: number;
  limite: number;
  nomeGerente: string;
  transacoes?: Transacao[];
}
