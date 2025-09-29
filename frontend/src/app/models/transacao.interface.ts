import { TipoTransacao } from './tipo-transacao.enum';

export interface Transacao {
  data: Date;
  tipo: TipoTransacao;
  valor: number;
  clienteOrigem?: string;
  clienteDestino?: string;
}
