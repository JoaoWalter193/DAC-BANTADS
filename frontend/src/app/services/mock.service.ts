import { Injectable } from '@angular/core';
import { Admin, Cliente, Conta, Gerente, Endereco } from '../models';
import { TipoEndereco } from '../enums/tipo-endereco';

@Injectable({
  providedIn: 'root'
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
      telefone: 43912345678,
      endereco: {
        TipoEndereco: TipoEndereco.avenida,
        logradouro: "Avenida da Catharyna",
        numero: 1,
        complemento: "apto 712",
        cidade: "Curitiba",
        estado: "PR",
        CEP: "80000-001"
      },
      senha: "tads"
    },
    {
      cpf: '09506382000',
      nome: 'Cleuddônio',
      email: 'cli2@bantads.com.br',
      role: 'CLIENTE',
      salario: 20000,
      telefone: 41945671234,
      endereco: {
        TipoEndereco: TipoEndereco.rua,
        logradouro: "Rua do Cleuddonio",
        numero: 2,
        complemento: "casa",
        cidade: "Curitiba",
        estado: "PR",
        CEP: "80000-002"
      },
      senha: "tads"
    }
  ];

  private gerentes: (Gerente & { senha: string })[] = [
    {
      cpf: '98574307084',
      nome: 'Geniéve',
      email: 'ger1@bantads.com.br',
      role: 'GERENTE',
      senha: "tads"
    }
  ];

  private admins: (Admin & { senha: string })[] = [
    {
      cpf: '40501740066',
      nome: 'Adamântio',
      email: 'adm1@bantads.com.br',
      role: 'ADMIN',
      senha: "tads"
    }
  ];

  private contas: Conta[] = [
    {
      numeroConta: '1291',
      cliente: this.clientes[0],
      saldo: 800.00,
      limite: 5000.00,
      nomeGerente: 'Geniéve',
      dataCriacao: '2000-01-01'
    },
    {
      numeroConta: '0950',
      cliente: this.clientes[1],
      saldo: -10000.00,
      limite: 10000.00,
      nomeGerente: 'Geniéve',
      dataCriacao: '1990-10-10'
    }
  ];

  constructor() { }

  // junta todos os usuarios (clientes estão separados de gerente e admin)
  // em uma lista allUsers pra buscar pelo email de login
  findUserByCredentials(email: string, password: string): Cliente | Gerente | Admin | undefined {
    const allUsers = [...this.clientes, ...this.gerentes, ...this.admins];
    const user = allUsers.find(u => u.email === email);

    if (user && user.senha === password) {
      return user;
    }
    return undefined;
  }

  // busca de uma conta pelo CPF do cliente
  findContaByClienteCpf(cpf: string): Conta | undefined {
    return this.contas.find(c => c.cliente.cpf === cpf);
  }
}
