import { Cliente } from '../cliente/cliente.interface';

export interface Gerente {
  cpf: string;
  nome: string;
  email: string;
  tipo: 'GERENTE';
  clientes?: Cliente[];
}
