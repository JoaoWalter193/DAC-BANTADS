export interface Transacao {
  data: string;
  tipo: string;
  valor: number;
  origem?: string;
  destino?: string;
}
