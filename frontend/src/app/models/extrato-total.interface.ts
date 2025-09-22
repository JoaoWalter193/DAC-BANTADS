import { ExtratoDia } from './extrato-dia.interface';

export interface ExtratoTotal {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  saldoInicial: number;
  dias: ExtratoDia[];
}
