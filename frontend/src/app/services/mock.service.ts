import { Injectable } from '@angular/core';
import { Admin, Cliente, Conta, Gerente, Endereco } from '../models';
import { TipoTransacao } from '../models/tipo-transacao.enum';

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
    {
      cpf: '85733854057',
      nome: 'Catianna',
      email: 'cli3@bantads.com.br',
      role: 'CLIENTE',
      salario: 3000,
      endereco: {
        tipo: 'Rua',
        logradouro: 'da Catianna',
        numero: 3,
        complemento: 'apto 101',
        cidade: 'Curitiba',
        estado: 'PR',
        CEP: '80000-003',
      },
      telefone: '41977777777',
      status: 'aprovado',
      dataSolicitacao: new Date('2023-01-03'),
      senha: 'tads',
    },
    {
      cpf: '58872160006',
      nome: 'Cutardo',
      email: 'cli4@bantads.com.br',
      role: 'CLIENTE',
      salario: 500,
      endereco: {
        tipo: 'Travessa',
        logradouro: 'do Cutardo',
        numero: 4,
        complemento: 'fundos',
        cidade: 'Curitiba',
        estado: 'PR',
        CEP: '80000-004',
      },
      telefone: '41966666666',
      status: 'aprovado',
      dataSolicitacao: new Date('2023-01-04'),
      senha: 'tads',
    },
    {
      cpf: '76179646090',
      nome: 'Coândrya',
      email: 'cli5@bantads.com.br',
      role: 'CLIENTE',
      salario: 1500,
      endereco: {
        tipo: 'Alameda',
        logradouro: 'da Coândrya',
        numero: 5,
        complemento: 'bloco B',
        cidade: 'Curitiba',
        estado: 'PR',
        CEP: '80000-005',
      },
      telefone: '41955555555',
      status: 'aprovado',
      dataSolicitacao: new Date('2023-01-05'),
      senha: 'tads',
    },
  ];

  private gerentes: (Gerente & { senha: string })[] = [
    {
      cpf: '98574307084',
      nome: 'Geniéve',
      email: 'ger1@bantads.com.br',
      role: 'GERENTE',
      clientes: [this.clientes[0], this.clientes[3]],
      senha: 'tads',
    },
    {
      cpf: '64065268052',
      nome: 'Godophredo',
      email: 'ger2@bantads.com.br',
      role: 'GERENTE',
      clientes: [this.clientes[1], this.clientes[4]],
      senha: 'tads',
    },
    {
      cpf: '23862179060',
      nome: 'Gyândula',
      email: 'ger3@bantads.com.br',
      role: 'GERENTE',
      clientes: [this.clientes[2]],
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
        //numeroConta: '1291',
        cliente: this.clientes[0],
        saldo: 800.0,
        limite: 5000.0,
        nomeGerente: 'Geniéve',
        dataCriacao: '2000-01-01',
        transacoes: [
          { data: new Date('2025-09-18T10:00:00Z'), tipo: TipoTransacao.DEPOSITO, valor: 500.00 },
          { data: new Date('2025-09-19T14:30:00Z'), tipo: TipoTransacao.SAQUE, valor: 200.00 },
          { data: new Date('2025-09-20T11:00:00Z'), tipo: TipoTransacao.TRANSFERENCIA, valor: 150.00, clienteOrigem: 'Catharyna', clienteDestino: 'Cleuddônio' },
        ],
      },
      {
        numeroConta: '2222',
        //numeroConta: '0950',
        cliente: this.clientes[1],
        saldo: -10000.0,
        limite: 10000.0,
        nomeGerente: 'Godophredo',
        dataCriacao: '1990-10-10',
        transacoes: [],
      },
      {
        numeroConta: '3333',
        //numeroConta: '8573',
        cliente: this.clientes[2],
        saldo: -1000.0,
        limite: 1500.0,
        nomeGerente: 'Gyândula',
        dataCriacao: '2012-12-12',
        transacoes: [],
      },
      {
        numeroConta: '4444',
        //numeroConta: '5887',
        cliente: this.clientes[3],
        saldo: 150000.0,
        limite: 0.0,
        nomeGerente: 'Geniéve',
        dataCriacao: '2022-02-22',
        transacoes: [],
      },
      {
        numeroConta: '5555',
        //numeroConta: '7617',
        cliente: this.clientes[4],
        saldo: 1500.0,
        limite: 0.0,
        nomeGerente: 'Godophredo',
        dataCriacao: '2025-01-01',
        transacoes: [],
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

  // função pra resetar o mock e corrigir valores e contas
  resetMockData(): void {
    localStorage.removeItem(LS_CHAVE);
    this.initLocalStorage();
    alert('pipipipipi resetado');
  }

  findClienteCpf(cpf: string): Cliente | undefined {
    return this.clientes.find((c) => c.cpf === cpf);
  }

  getClientes(): Cliente[] {
    return this.clientes;
  }

  getClienteByCpf(cpf: string): Cliente | null {
    const cpfNumerico = cpf.replace(/\D/g, '');
    return (
      this.getClientes().find(
        (c) => (c.cpf || '').replace(/\D/g, '') === cpfNumerico
      ) || null
    );
  }

  updateCliente(cliente: Cliente): Cliente | null {
    const cpf = (cliente.cpf || '').replace(/\D/g, '');

    const clienteNormalizado = { ...cliente, cpf };

    console.log('Tentando atualizar CPF:', cpf);
    console.log('Clientes globais disponíveis (antes):', this.clientes);

    let globalIndex = this.clientes.findIndex(
      (c) => (c.cpf || '').replace(/\D/g, '') === cpf
    );
    if (globalIndex !== -1) {
      this.clientes[globalIndex] = {
        ...this.clientes[globalIndex],
        ...clienteNormalizado,
      };
      console.log('Cliente atualizado (global):', this.clientes[globalIndex]);
    } else {
      this.clientes.push({
        ...clienteNormalizado,
        senha: clienteNormalizado['senha'] || '',
      });
      globalIndex = this.clientes.length - 1;
      console.log('Cliente adicionado ao global:', this.clientes[globalIndex]);
    }

    for (const gerente of this.gerentes) {
      if (!gerente.clientes) continue;
      const gi = gerente.clientes.findIndex(
        (c) => (c.cpf || '').replace(/\D/g, '') === cpf
      );
      if (gi !== -1) {
        gerente.clientes[gi] = {
          ...gerente.clientes[gi],
          ...clienteNormalizado,
        };
        console.log(
          `Cliente atualizado dentro do gerente ${gerente.nome}:`,
          gerente.clientes[gi]
        );
      }
    }

    const currentUserJSON = localStorage.getItem('currentUser');
    if (currentUserJSON) {
      const currentUser = JSON.parse(currentUserJSON);

      if (
        currentUser.user?.role === 'GERENTE' &&
        Array.isArray(currentUser.user.clientes)
      ) {
        const ci = currentUser.user.clientes.findIndex(
          (c: Cliente) => (c.cpf || '').replace(/\D/g, '') === cpf
        );
        if (ci !== -1) {
          currentUser.user.clientes[ci] = {
            ...currentUser.user.clientes[ci],
            ...clienteNormalizado,
          };
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          console.log(
            'Cliente atualizado no currentUser (gerente):',
            currentUser.user.clientes[ci]
          );
        }
      }

      if (
        currentUser.user?.role === 'CLIENTE' &&
        (currentUser.user.cpf || '').replace(/\D/g, '') === cpf
      ) {
        currentUser.user = { ...currentUser.user, ...clienteNormalizado };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log(
          'Cliente atualizado no currentUser (cliente):',
          currentUser.user
        );
      }
    }

    return this.clientes[globalIndex] || null;
  }

  getGerenteComMenosClientes(): Gerente {
    return this.gerentes.reduce((prev, curr) =>
      (prev.clientes?.length ?? 0) <= (curr.clientes?.length ?? 0) ? prev : curr
    );
  }

  getClientesDoGerente(cpfGerente: string): Cliente[] {
    const gerente = this.gerentes.find((g) => g.cpf === cpfGerente);
    return gerente?.clientes || [];
  }

  addClienteAoGerente(cliente: Cliente) {
    cliente.cpf = cliente.cpf.replace(/\D/g, '');

    const cpfExistente =
      this.clientes.some((c) => c.cpf === cliente.cpf) ||
      this.gerentes.some((g) => g.clientes?.some((c) => c.cpf === cliente.cpf));

    if (cpfExistente) {
      console.warn(`CPF ${cliente.cpf} já cadastrado. Cadastro abortado.`);
      return false;
    }

    const gerente = this.getGerenteComMenosClientes();
    if (!gerente.clientes) gerente.clientes = [];

    this.clientes.push(cliente);
    gerente.clientes.push({ ...cliente, status: 'pendente' });

    console.log('Cliente adicionado ao global:', this.clientes);
    console.log('Cliente adicionado ao gerente:', gerente);

    return true;
  }

  getGerentes(): Gerente[] {
    return this.gerentes;
  }

  criarContaParaCliente(
    cliente: Cliente,
    numeroConta: string,
    limite: number,
    senha: string
  ): void {
    const contas: Conta[] = JSON.parse(localStorage.getItem(LS_CHAVE) || '[]');

    const novaConta: Conta = {
      numeroConta,
      cliente: { ...cliente, senha, conta: numeroConta },
      saldo: 0,
      limite,
      nomeGerente: this.getGerenteComMenosClientes().nome,
      dataCriacao: new Date().toISOString(),
    };

    contas.push(novaConta);
    localStorage.setItem(LS_CHAVE, JSON.stringify(contas));

    console.log('Conta criada no LS:', novaConta);
  }
}
