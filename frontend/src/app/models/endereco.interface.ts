import { TipoEndereco } from '../enums/tipo-endereco';

export interface EnderecoInterface {
  TipoEndereco: TipoEndereco;
  logradouro: string;
  numero: number;
  complemento: string;
  CEP: string;
  cidade: string;
  estado: string;
}
