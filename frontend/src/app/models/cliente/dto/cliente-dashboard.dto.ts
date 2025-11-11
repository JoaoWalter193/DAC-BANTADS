import { Cliente } from "../cliente.interface";


export interface ClienteDashboardDTO extends Cliente {
  conta: string;
  saldo: number;
  limite: number;

  cpfGerente: string;
  nomeGerente: string;
}
