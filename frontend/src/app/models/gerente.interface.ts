import { Cliente } from "./cliente.interface";

export interface Gerente {
  cpf: string;
  nome: string;
  email: string;
  role: 'GERENTE';
  clientes?: Cliente[];
  senha: string; // somente para testes
}
