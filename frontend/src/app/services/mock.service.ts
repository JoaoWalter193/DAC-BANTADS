import { Injectable } from '@angular/core';
import { Admin, Cliente, Conta, Gerente, Endereco } from '../models';
import { TipoTransacao } from '../models/tipo-transacao.enum';

const LS_CHAVE = 'contaCliente';
const LS_CHAVE_CLIENTE = 'cliente';

@Injectable({
  providedIn: 'root',
})
// mock centralizado para testes
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
        CEP: '80000001',
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
        CEP: '80000002',
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
        CEP: '80000003',
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
        CEP: '80000004',
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
        CEP: '80000005',
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
          {
            data: new Date('2025-09-18T10:00:00Z'),
            tipo: TipoTransacao.DEPOSITO,
            valor: 500.0,
          },
          {
            data: new Date('2025-09-19T14:30:00Z'),
            tipo: TipoTransacao.SAQUE,
            valor: 200.0,
          },
          {
            data: new Date('2025-09-20T11:00:00Z'),
            tipo: TipoTransacao.TRANSFERENCIA,
            valor: 150.0,
            clienteOrigem: 'Catharyna',
            clienteDestino: 'Cleuddônio',
          },
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
    if (!localStorage.getItem(LS_CHAVE_CLIENTE)) {
      localStorage.setItem(LS_CHAVE_CLIENTE, JSON.stringify(this.clientes));
    }

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
    const clientes = this.getClientes();
    const allUsers = [...clientes, ...this.gerentes, ...this.admins];

    const user = allUsers.find((u) => u.email === email);

    if (!user) {
      console.error(`Usuário com email "${email}" não encontrado.`);
      return undefined;
    }

    console.log('Usuário encontrado. Dados:', user);

    if (user.senha && user.senha === password) {
      return user;
    } else {
      return undefined;
    }
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
    localStorage.removeItem(LS_CHAVE_CLIENTE);
    this.initLocalStorage();
    alert('pipipipipi resetado');
  }

  findClienteCpf(cpf: string): Cliente | undefined {
    return this.clientes.find((c) => c.cpf === cpf);
  }

  getClientes(): Cliente[] {
    return JSON.parse(localStorage.getItem(LS_CHAVE_CLIENTE) || '[]');
  }

  getClienteByCpf(cpf: string): Cliente | null {
    const cpfNumerico = cpf.replace(/\D/g, '');
    return (
      this.getClientes().find(
        (c) => (c.cpf || '').replace(/\D/g, '') === cpfNumerico
      ) || null
    );
  }

  updateCliente(clienteAtualizadoParcial: Cliente): Cliente | null {
    const clientes = this.getClientes();
    const index = clientes.findIndex(
      (c) => c.cpf === clienteAtualizadoParcial.cpf
    );

    if (index !== -1) {
      const clienteOriginalCompleto = clientes[index];

      clientes[index] = {
        ...clienteOriginalCompleto,
        ...clienteAtualizadoParcial,
      };

      localStorage.setItem(LS_CHAVE_CLIENTE, JSON.stringify(clientes));

      const contas: Conta[] = JSON.parse(
        localStorage.getItem(LS_CHAVE) || '[]'
      );
      const contaIndex = contas.findIndex(
        (c) => c.cliente.cpf === clienteAtualizadoParcial.cpf
      );
      if (contaIndex !== -1) {
        contas[contaIndex].cliente = clientes[index];
        localStorage.setItem(LS_CHAVE, JSON.stringify(contas));
      }

      return clientes[index];
    }

    return null;
  }

  getClientesLS(): Cliente[] {
    return JSON.parse(localStorage.getItem(LS_CHAVE_CLIENTE) || '[]');
  }

  updateClientesLS(clientesAtualizados: Cliente[]): void {
    localStorage.setItem(LS_CHAVE_CLIENTE, JSON.stringify(clientesAtualizados));
  }

  addClienteLS(cliente: Cliente): void {
    const clientes = this.getClientesLS();
    clientes.push(cliente);
    this.updateClientesLS(clientes);
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
      this.getClientes().some((c) => c.cpf === cliente.cpf) ||
      this.gerentes.some((g) => g.clientes?.some((c) => c.cpf === cliente.cpf));

    if (cpfExistente) {
      console.warn(`CPF ${cliente.cpf} já cadastrado. Cadastro abortado.`);
      return false;
    }

    const gerente = this.getGerenteComMenosClientes();
    if (!gerente.clientes) gerente.clientes = [];

    const clienteComSenha: Cliente & { senha: string } = {
      ...cliente,
      status: 'pendente',
      senha: '',
    };

    this.clientes.push(clienteComSenha);
    this.addClienteLS(clienteComSenha);

    gerente.clientes.push(clienteComSenha);

    console.log('Cliente adicionado à lista em memória:', this.clientes);
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

  verificarOuAdicionarClienteLS(novoCliente: Cliente): boolean {
    const clientes = this.getClientesLS();
    const jaExiste = clientes.some((c) => c.cpf === novoCliente.cpf);

    if (jaExiste) {
      return false;
    }

    clientes.push(novoCliente);
    this.updateClientesLS(clientes);
    return true;
  }
}
