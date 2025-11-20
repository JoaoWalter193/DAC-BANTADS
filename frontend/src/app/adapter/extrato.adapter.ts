import { ContaExtrato } from '../models/conta/conta-extrato.interface';
import { Transacao } from '../models/conta/transacao.interface';

export function adaptarExtratoApi(api: any): ContaExtrato {
  const transacoes = api.movimentacoes as Transacao[];

  const agrupadoPorDia = transacoes.reduce((acc, transacao) => {
    const dia = transacao.data.substring(0, 10);

    if (!acc[dia]) {
      acc[dia] = {
        data: new Date(dia),
        saldoConsolidado: 0,
        transacoes: [],
      };
    }

    acc[dia].transacoes.push(transacao);

    return acc;
  }, {} as Record<string, any>);

  return {
    periodo: {
      inicio: new Date(),
      fim: new Date(),
    },
    saldoInicial: api.saldo,
    movimentacoes: Object.values(agrupadoPorDia),
  };
}
