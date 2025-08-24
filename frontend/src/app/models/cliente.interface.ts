import { Endereco } from './endereco.interface';

export interface Cliente {
  cpf: string;
  nome: string;
  email: string;
  endereco: Endereco;
  telefone: number;
  salario: number;
  role: 'CLIENTE';
  senha: string // somente para testes
}
