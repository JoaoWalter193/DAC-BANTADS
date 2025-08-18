import { ClienteInterface as Cliente } from './cliente.interface';

export interface Conta {
  cliente: Cliente;
  numeroConta: string;
  dataCriacao: string;
  saldo: number;
  limite: number;
}
