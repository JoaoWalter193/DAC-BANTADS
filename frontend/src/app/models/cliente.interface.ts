import { Endereco } from './endereco.interface';

export interface Cliente {
  nome: string;
  email: string;
  cpf: string;
  salario: number;
  endereco: Endereco;
  telefone: string;
  status: 'aprovado' | 'rejeitado' | 'pendente';
  dataSolicitacao: Date;
  role: 'CLIENTE';
  senha: string // somente para testes
}
