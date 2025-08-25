import { Endereco } from './endereco.interface';

export interface Cliente {
  cpf: string;
  nome: string;
  email: string;
  endereco: Endereco;
  salario: number;
  role: 'CLIENTE';
  senha: string // somente para testes
  status: 'aprovado' | 'rejeitado' | 'pendente';
  dataSolicitacao: Date;
}
