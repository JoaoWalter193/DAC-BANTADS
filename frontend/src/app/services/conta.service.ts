import { Injectable } from '@angular/core';
import { Conta } from '../models/conta.interface';
import { AuthService } from './auth.service';
import { MockService } from './mock.service';
import { ExtratoDia, ExtratoTotal, TipoTransacao, Transacao } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  constructor(private authService: AuthService, private mockService: MockService) {}

  getConta(): Conta | null {
    const session = this.authService.getUserSession();
    if (session?.user.role === 'CLIENTE') {
      // busca a conta mais recente do "banco de dados" persistente
      return this.mockService.findContaCpf(session.user.cpf) ?? null;
    }
    return null;
  }

  sacar(valor: number): Conta {
    const session = this.authService.getUserSession();
    if (!session) {
      throw new Error('Sessão expirada.');
    }

    const conta = this.mockService.findContaCpf(session.user.cpf);
    if (!conta) {
      throw new Error('Sessão expirada.');
    }

    // calcula o saldo + limite
    const saldoDisponivel = conta.saldo + conta.limite;
    if (valor > saldoDisponivel) {
      throw new Error('Saldo insuficiente.');
    }
    if (valor <= 0) {
      throw new Error('Por favor, insira um valor válido.');
    }

    // atualiza o valore e registra a transacao
    conta.saldo -= valor;
    const novaTransacao: Transacao = {
      data: new Date(),
      tipo: TipoTransacao.SAQUE,
      valor: valor
    };
    conta.transacoes?.push(novaTransacao);

    // salva no localStorage
    this.mockService.updateConta(conta);
    session.conta = conta;
    localStorage.setItem('currentUser', JSON.stringify(session));
    return conta;
  }

  depositar(valor: number): Conta {
    const session = this.authService.getUserSession();
    if (!session) {
      throw new Error('Sessão expirada.');
    }

    const conta = this.mockService.findContaCpf(session.user.cpf);
    if (!conta) {
      throw new Error('Sessão expirada.');
    }
    if (valor <= 0) {
      throw new Error('Por favor, insira um valor válido.');
    }

    conta.saldo += valor;
    const novaTransacao: Transacao = {
      data: new Date(),
      tipo: TipoTransacao.DEPOSITO,
      valor: valor
    };
    conta.transacoes?.push(novaTransacao);

    this.mockService.updateConta(conta);
    session.conta = conta;
    localStorage.setItem('currentUser', JSON.stringify(session));
    return conta;
  }

  transferir(valor: number, numeroContaDestino: string): Conta {
    const session = this.authService.getUserSession();
    if (!session) {
      throw new Error('Sessão expirada.');
    }
    if (!numeroContaDestino) {
      throw new Error('Por favor, insira o numero da conta a receber.');
    }
    if (valor <= 0) {
      throw new Error('Por favor, insira um valor válido.');
    }

    // buscar origem e destino
    const contaOrigem = this.mockService.findContaCpf(session.user.cpf);
    const contaDestino = this.mockService.findContaNumero(numeroContaDestino);

    if (!contaOrigem) {
      throw new Error('Sessão expirada.');
    }
    if (!contaDestino) {
      throw new Error('A conta informada nao existe.');
    }
    if (contaOrigem.numeroConta === contaDestino.numeroConta) {
      throw new Error('Você deve informar uma conta diferente.');
    }

    // valida saldo
    const saldoDisponivel = contaOrigem.saldo + contaOrigem.limite;
    if (valor > saldoDisponivel) {
      throw new Error('Saldo insuficiente para a transação.');
    }

    // atualiza os saldos
    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    // registra a transacao nas duas contas
    const transacaoSaida: Transacao = {
      data: new Date(),
      tipo: TipoTransacao.TRANSFERENCIA,
      valor: valor,
      clienteOrigem: contaOrigem.cliente.nome,
      clienteDestino: contaDestino.cliente.nome
    };
    const transacaoEntrada: Transacao = { ...transacaoSaida };

    contaOrigem.transacoes?.push(transacaoSaida);
    contaDestino.transacoes?.push(transacaoEntrada);

    // salva no localStorage
    this.mockService.updateConta(contaOrigem);
    this.mockService.updateConta(contaDestino);

    session.conta = contaOrigem;
    localStorage.setItem('currentUser', JSON.stringify(session));

    return contaOrigem;
  }

  gerarExtrato(dataInicio: Date, dataFim: Date): ExtratoTotal {
    const conta = this.getConta();
    if (!conta || !conta.transacoes) {
      throw new Error('Nenhuma operação encontrada para esta conta.');
    }

    // correcao pra pegar o dia do inicio ao fim
    dataInicio.setHours(0, 0, 0, 0);
    dataFim.setHours(23, 59, 59, 999);

    // pega o saldo inicial e calcula os anteriores de forma retroativa
    let saldoInicial = conta.saldo;
    const transacoesPosteriores = conta.transacoes.filter(t => new Date(t.data) >= dataInicio);

    for (const t of transacoesPosteriores) {
      const entrada = t.tipo === TipoTransacao.DEPOSITO || (t.tipo === TipoTransacao.TRANSFERENCIA && t.clienteDestino === conta.cliente.nome);
      if (entrada) {
        saldoInicial -= t.valor; // entrada = subtrai
      } else {
        saldoInicial += t.valor; // saida = soma
      }
    }

    // transacoes do dia
    const transacoesNoPeriodo = conta.transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= dataInicio && dataTransacao <= dataFim;
    });

    // construir o extrato diario
    const extrato: ExtratoDia[] = [];
    let saldoDoDia = saldoInicial;

    for (let dia = new Date(dataInicio); dia <= dataFim; dia.setDate(dia.getDate() + 1)) {
      const dataCorrenteStr = dia.toISOString().split('T')[0];

      const transacoesDoDia = transacoesNoPeriodo.filter(
        t => new Date(t.data).toISOString().split('T')[0] === dataCorrenteStr
      );

      // correcao no saldo final de cada dia
      let saldoFinalDoDia = saldoDoDia;
      for (const t of transacoesDoDia) {
        const entrada = t.tipo === TipoTransacao.DEPOSITO || (t.tipo === TipoTransacao.TRANSFERENCIA && t.clienteDestino === conta.cliente.nome);
        saldoFinalDoDia += entrada ? t.valor : -t.valor;
      }

      extrato.push({
        data: new Date(dia),
        transacoes: transacoesDoDia.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
        saldoConsolidado: saldoFinalDoDia
      });

      // seta o saldo do dia seguinte
      saldoDoDia = saldoFinalDoDia;
    }

    return {
      periodo: { inicio: dataInicio, fim: dataFim },
      saldoInicial: saldoInicial,
      dias: extrato
    };
  }
}
