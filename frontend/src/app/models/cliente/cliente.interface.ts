import { Endereco } from "./endereco.interface";

export interface Cliente {
  cpf: string;
  nome: string;
  email: string;
  salario: number;
  endereco: Endereco;
  cidade: string;
  estado: string;
  tipo: 'CLIENTE';
  
  conta?: string;
  saldo?: number;
  limite?: number;

  gerente?: string;
  gerente_nome?: string;
  gerente_email?: string;

  motivoRejeicao?: string;
  dataDecisao?: string;
  dataSolicitacao?: string;
}
