import { TipoTransacao } from "./tipo-transacao.enum";

export interface Transacao {
  data: string;
  tipo: TipoTransacao;
  valor: number;
  origem?: string;
  destino?: string;
}
