import { Injectable } from '@angular/core';
import { Conta } from '../models/conta.interface';
import { AuthService } from './auth.service';
import { MockService } from './mock.service';
import { ExtratoDia, ExtratoTotal, TipoTransacao } from '../models';

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
    if (valor <= 0) {
      throw new Error('Por favor, insira um valor válido.');
    }
    // calcula o saldo + limite
    const saldoDisponivel = conta.saldo + conta.limite;
    if (valor > saldoDisponivel) {
      throw new Error('Saldo insuficiente.');
    }
    // atualiza o valor e salva no localStorage
    conta.saldo -= valor;
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

    // atualiza as contas
    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;
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

    // ultimo segundo como data final
    dataFim.setHours(23, 59, 59, 999);

    const todasTransacoes = conta.transacoes.map(op => ({ ...op, data: new Date(op.data) }));

    // calcular o saldo antes da data marcada
    const saldoInicialPeriodo = todasTransacoes
      .filter(op => op.data < dataInicio).reduce((saldo, op) => {
        return op.tipo === TipoTransacao.DEPOSITO || (op.tipo === TipoTransacao.TRANSFERENCIA && op.clienteDestino === conta.cliente.nome)
          ? saldo + op.valor
          : saldo - op.valor;
      },
      //para começar do saldo base
      conta.saldo - todasTransacoes.reduce((sum, op) => op.tipo === TipoTransacao.DEPOSITO ? sum + op.valor : sum - op.valor, 0));

    const extrato: ExtratoDia[] = [];
    let saldoConsolidado = saldoInicialPeriodo;

    // diaa dia, da data inicial ate a final
    for (let dia = new Date(dataInicio); dia <= dataFim; dia.setDate(dia.getDate() + 1)) {
      const inicioDoDia = new Date(dia.setHours(0, 0, 0, 0));
      const fimDoDia = new Date(dia.setHours(23, 59, 59, 999));

      const operacoesDoDia = todasTransacoes.filter(op => op.data >= inicioDoDia && op.data <= fimDoDia);

      // calcula o saldo do dia
      operacoesDoDia.forEach(op => {
        saldoConsolidado += op.tipo === TipoTransacao.DEPOSITO || (op.tipo === TipoTransacao.TRANSFERENCIA && op.clienteDestino === conta.cliente.nome)
          ? op.valor
          : -op.valor;
      });

      extrato.push({
        data: new Date(inicioDoDia),
        transacoes: operacoesDoDia.sort((a, b) => a.data.getTime() - b.data.getTime()),
        saldoConsolidado: saldoConsolidado
      });
    }

    return {
      periodo: { inicio: dataInicio, fim: dataFim },
      saldoInicial: saldoInicialPeriodo,
      dias: extrato
    };
  }
}
