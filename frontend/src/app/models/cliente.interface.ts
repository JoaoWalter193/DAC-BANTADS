import { Endereco } from './endereco.interface';

export interface Cliente {
  cpf: string;
  nome: string;
  email: string;
  endereco: Endereco;
  salario: number;
  status: 'aprovado' | 'rejeitado' | 'pendente';
  dataSolicitacao: Date;
  role: 'CLIENTE';
  senha: string // somente para testes
}
