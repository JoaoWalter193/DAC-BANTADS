import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { MockService } from './mock.service';
import { Cliente, Conta, Gerente } from '../models';
import { BehaviorSubject } from 'rxjs';

interface ClienteDashboardDTO extends Cliente {
  conta: string;
  saldo: number;
  limite: number;
  cpfGerente: string;
  nomeGerente: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  constructor(
    private mockService: MockService,
    private authService: AuthService
  ) {}

  getClienteLogado(): Cliente | null {
    const userSession = this.authService.getUserSession();
    if (userSession && userSession.user.role === 'CLIENTE') {
      const clientes = this.mockService.getClientes();
      return clientes.find((c) => c.cpf === userSession.user.cpf) || null;
    }
    return null;
  }

  updateCliente(cliente: Cliente) {
    const updated = this.mockService.updateCliente(cliente);
    this.carregarClientes();
    return updated;
  }

  getClientesPendentes(gerenteCpf: string): Cliente[] {
    return this.mockService
      .getClientesDoGerente(gerenteCpf)
      .filter((c) => c.status === 'pendente');
  }

  private clientesSubject = new BehaviorSubject<ClienteDashboardDTO[]>([]);
  clientes$ = this.clientesSubject.asObservable();

  carregarClientes() {
    const currentUserJSON = localStorage.getItem('currentUser');
    const contasJSON = localStorage.getItem('contaCliente');

    if (!currentUserJSON || !contasJSON) {
      this.clientesSubject.next([]);
      return [];
    }

    const gerente: Gerente = JSON.parse(currentUserJSON).user;
    const contas: Conta[] = JSON.parse(contasJSON);

    const lista = (gerente.clientes || [])
      .filter((cliente) => cliente.status === 'aprovado')
      .map((cliente) => {
        const conta = contas.find((c) => c.cliente.cpf === cliente.cpf);

        return {
          ...cliente,
          conta: conta ? conta.numeroConta : '',
          saldo: conta ? conta.saldo : 0,
          limite: conta ? conta.limite : 0,
          cpfGerente: gerente.cpf,
          nomeGerente: gerente.nome,
        } as ClienteDashboardDTO;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));

    this.clientesSubject.next(lista);
    return lista;
  }
}
