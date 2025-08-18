import { Injectable } from '@angular/core';
import { Conta } from '../models/conta.interface';

const LS_CHAVE = 'contaCliente';

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  constructor() {
    if (!localStorage.getItem(LS_CHAVE)) {
      this.inicializarConta();
    }
  }

  private inicializarConta() {
    const contaInicial = {
      cliente: {
        cpf: '29404904902',
        nome: 'Caio Isaac Freitas',
        email: 'caio.isaac.freitas@agenziamarketing.com.br',
        endereco: {
          TipoEndereco: 'rua',
          logradouro: 'São Januário',
          numero: '437',
          complemento: 'Jardim Botânico',
          CEP: '80210300',
          cidade: 'Curitiba',
          estado: 'PR',
        },
        telefone: '4139594934',
        salario: 5000.0,
      },
      numeroConta: '123456',
      dataCriacao: new Date().toISOString(),
      saldo: 1000.0,
      limite: 3000.0,
    };
    localStorage.setItem(LS_CHAVE, JSON.stringify(contaInicial));
  }

  getConta(): Conta | null {
    const dadosConta = localStorage.getItem(LS_CHAVE);
    return dadosConta ? (JSON.parse(dadosConta) as Conta) : null;
  }

  depositar(valor: number) {}
  sacar(valor: number) {}
  transferir(valor: number) {}
}
