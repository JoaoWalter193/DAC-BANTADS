import { Injectable } from '@angular/core';
import { Conta } from '../models/conta.interface';
import { AuthService } from './auth.service';
import { MockService } from './mock.service';

// const LS_CHAVE = 'contaCliente';

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  constructor(private authService: AuthService, private mockService: MockService) {}

  getConta(): Conta | null {
    const session = this.authService.getUserSession();
    if (session?.user.role === 'CLIENTE') {
      // Busca a conta mais recente do "banco de dados" persistente
      return this.mockService.findContaCpf(session.user.cpf) ?? null;
    }
    return null;
  }

  // constructor() {
  //   if (!localStorage.getItem(LS_CHAVE)) {
  //     this.inicializarConta();
  //   }
  // }

  // private inicializarConta() {
  //   const contaInicial = {
  //     cliente: {
  //       cpf: '29404904902',
  //       nome: 'Caio Isaac Freitas',
  //       email: 'caio.isaac.freitas@agenziamarketing.com.br',
  //       endereco: {
  //         TipoEndereco: 'rua',
  //         logradouro: 'São Januário',
  //         numero: '437',
  //         complemento: 'Jardim Botânico',
  //         CEP: '80210300',
  //         cidade: 'Curitiba',
  //         estado: 'PR',
  //       },
  //       telefone: '4139594934',
  //       salario: 5000.0,
  //     },
  //     numeroConta: '123456',
  //     dataCriacao: new Date().toISOString(),
  //     saldo: 1000.0,
  //     limite: 3000.0,
  //   };
  //   localStorage.setItem(LS_CHAVE, JSON.stringify(contaInicial));
  // }

  // getConta(): Conta | null {
  //   const dadosConta = localStorage.getItem(LS_CHAVE);
  //   return dadosConta ? (JSON.parse(dadosConta) as Conta) : null;
  // }

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

  transferir(valor: number) {}
}
