import { EnderecoInterface as Endereco } from './endereco.interface';

export interface ClienteInterface {
  cpf: string;
  nome: string;
  email: string;
  endereco: Endereco;
  salario: number;
  status: 'aprovado' | 'rejeitado' | 'pendente';
  dataSolicitacao: Date;
}
