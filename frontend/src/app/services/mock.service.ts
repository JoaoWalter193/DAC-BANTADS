import { Injectable } from '@angular/core';
import { Admin, Cliente, Conta, Gerente, Endereco } from '../models';

const LS_CHAVE = 'contaCliente';

@Injectable({
  providedIn: 'root',
})
// mock centralizado neste serviço para testes
export class MockService {
  private clientes: (Cliente & { senha: string })[] = [
    {
      cpf: '12912861012',
      nome: 'Catharyna',
      email: 'cli1@bantads.com.br',
      role: 'CLIENTE',
      salario: 10000,
      endereco: {
        tipo: 'Avenida',
        logradouro: 'da Catharyna',
        numero: 1,
        complemento: 'apto 712',
        cidade: 'Curitiba',
        estado: 'PR',
        CEP: '80000-001',
      },
      telefone: '41999999999',
      status: 'aprovado',
      dataSolicitacao: new Date('2023-01-01'),
      senha: 'tads',
    },
    {
      cpf: '09506382000',
      nome: 'Cleuddônio',
      email: 'cli2@bantads.com.br',
      role: 'CLIENTE',
      salario: 20000,
      endereco: {
        tipo: 'Rua',
        logradouro: 'do Cleuddonio',
        numero: 2,
        complemento: 'casa',
        cidade: 'Curitiba',
        estado: 'PR',
        CEP: '80000-002',
      },
      telefone: '41988888888',
      status: 'aprovado',
      dataSolicitacao: new Date('2023-01-02'),
      senha: 'tads',
    },
  ];

  private gerentes: (Gerente & { senha: string })[] = [
    {
      cpf: '98574307084',
      nome: 'Geniéve',
      email: 'ger1@bantads.com.br',
      role: 'GERENTE',
      clientes: [this.clientes[0], this.clientes[1]],
      senha: 'tads',
    },
  ];

  private admins: (Admin & { senha: string })[] = [
    {
      cpf: '40501740066',
      nome: 'Adamântio',
      email: 'adm1@bantads.com.br',
      role: 'ADMIN',
      senha: 'tads',
    },
  ];

  private getContasBase(): Conta[] {
    return [
      {
        numeroConta: '1111',
        cliente: this.clientes[0],
        saldo: 800.0,
        limite: 5000.0,
        nomeGerente: 'Geniéve',
        dataCriacao: '2000-01-01',
      },
      {
        numeroConta: '2222',
        cliente: this.clientes[1],
        saldo: -10000.0,
        limite: 10000.0,
        nomeGerente: 'Geniéve',
        dataCriacao: '1990-10-10',
      },
    ];
  }

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage(): void {
    if (!localStorage.getItem(LS_CHAVE)) {
      localStorage.setItem(LS_CHAVE, JSON.stringify(this.getContasBase()));
    }
  }

  // junta todos os usuarios (clientes estão separados de gerente e admin)
  // em uma lista allUsers pra buscar pelo email de login
  autenticarUsuario(
    email: string,
    password: string
  ): Cliente | Gerente | Admin | undefined {
    const allUsers = [...this.clientes, ...this.gerentes, ...this.admins];
    const user = allUsers.find((u) => u.email === email);

    if (user && user.senha === password) {
      return user;
    }
    return undefined;
  }

  // busca de uma conta pelo CPF do cliente
  findContaCpf(cpf: string): Conta | undefined {
    const contas: Conta[] = JSON.parse(localStorage.getItem(LS_CHAVE) || '[]');
    return contas.find((c) => c.cliente.cpf === cpf);
  }

  findContaNumero(numeroConta: string): Conta | undefined {
    const contas: Conta[] = JSON.parse(localStorage.getItem(LS_CHAVE) || '[]');
    return contas.find((c) => c.numeroConta === numeroConta);
  }

  // salva conta atualizada no LS
  updateConta(contaAtualizada: Conta): void {
    let contas: Conta[] = JSON.parse(localStorage.getItem(LS_CHAVE) || '[]');
    const index = contas.findIndex(
      (c) => c.numeroConta === contaAtualizada.numeroConta
    );
    if (index !== -1) {
      contas[index] = contaAtualizada;
      localStorage.setItem(LS_CHAVE, JSON.stringify(contas));
    }
  }

  // NOVO: Função útil para testes, para restaurar os dados originais.
  resetMockData(): void {
    localStorage.removeItem(LS_CHAVE);
    this.initLocalStorage();
    alert('Dados do mock restaurados para os valores iniciais!');
  }

  findClienteCpf(cpf: string): Cliente | undefined {
    return this.clientes.find((c) => c.cpf === cpf);
  }

  getClientes(): Cliente[] {
    return this.clientes;
  }

  updateCliente(cliente: Cliente): Cliente | null {
    const index = this.clientes.findIndex((c) => c.cpf === cliente.cpf);

    if (index !== -1) {
      this.clientes[index] = { ...this.clientes[index], ...cliente };
      console.log('Cliente atualizado: ', this.clientes[index]);
      return this.clientes[index];
    }

    console.error('Cliente ' + cliente.cpf + ' não encontrado');
    return null;
  }
}
