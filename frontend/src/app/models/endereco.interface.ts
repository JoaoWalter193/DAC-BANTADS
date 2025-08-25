import { TipoEndereco } from '../enums/tipo-endereco';

export interface Endereco {
  TipoEndereco: TipoEndereco;
  logradouro: string;
  numero: number;
  complemento: string;
  CEP: string;
  cidade: string;
  estado: string;
}
