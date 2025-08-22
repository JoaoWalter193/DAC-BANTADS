import { EnderecoInterface as Endereco } from './endereco.interface';

export interface ClienteInterface {
  cpf: string;
  nome: string;
  email: string;
  endereco: Endereco;
  telefone: number;
  salario: number;
}
