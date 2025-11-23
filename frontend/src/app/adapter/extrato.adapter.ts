import { ContaExtrato } from '../models/conta/conta-extrato.interface';
import { Transacao } from '../models/conta/transacao.interface';


function safeDate(val: any): Date {
  if (!val) return new Date();
  return new Date(val);
}

export function adaptarExtratoApi(api: any): ContaExtrato {
  if (!api) {
    return {
      saldoInicial: 0,
      periodo: { inicio: new Date(), fim: new Date() },
      movimentacoes: []
    };
  }


  const rawMovimentacoes = api.movimentacoes || [];

  const transacoes: Transacao[] = rawMovimentacoes.map((m: any) => ({
    data: safeDate(m.dataHora || m.data) as any,
    tipo: m.tipo || 'Operação',
    valor: m.valor || 0,
    origem: m.clienteOrigemNome || m.origem || '',
    destino: m.clienteDestinoNome || m.destino || ''
  }));


  const agrupadoPorDia = transacoes.reduce((acc, transacao) => {
    const dataObj = new Date(transacao.data);
    const dia = dataObj.toISOString().split('T')[0];

    if (!acc[dia]) {
      acc[dia] = {
        data: new Date(dia + 'T00:00:00'),
        saldoConsolidado: 0,
        transacoes: [],
      };
    }

    acc[dia].transacoes.push(transacao);

    return acc;
  }, {} as Record<string, any>);

  const inicio = api.periodo?.inicio ? safeDate(api.periodo.inicio) : new Date();
  const fim = api.periodo?.fim ? safeDate(api.periodo.fim) : new Date();

  const movimentacoesOrdenadas = Object.values(agrupadoPorDia).sort((a: any, b: any) =>
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return {
    periodo: {
      inicio: inicio,
      fim: fim,
    },
    saldoInicial: api.saldo || 0,
    movimentacoes: movimentacoesOrdenadas,
  };
}
