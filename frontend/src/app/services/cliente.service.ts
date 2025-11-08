import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { ClienteDashboardDTO } from '../dto/cliente-dashboard.dto';
import { Cliente, Conta, Gerente } from '../models';

import { AuthService } from './auth.service';
import { MockService } from './mock.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private clientesSubject = new BehaviorSubject<ClienteDashboardDTO[]>([]);
  clientes$ = this.clientesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private mock: MockService,
    private auth: AuthService
  ) {}

  getClienteLogado() {
    if (environment.useMock) {
      return this.getClienteLogadoMock();
    }

    return this.http.get<Cliente>(`${environment.apiUrl}/cliente/logado`);
  }

  private getClienteLogadoMock(): Cliente | null {
    const session = this.auth.getUserSession();
    if (!session || session.user.role !== 'CLIENTE') return null;

    const clientes = this.mock.getClientes();
    return clientes.find((c) => c.cpf === session.user.cpf) || null;
  }

  carregarClientes() {
    if (environment.useMock) {
      const data = this.carregarClientesMock();
      this.clientesSubject.next(data);
      return;
    }

    const gerenteCpf = this.auth.getUserSession()?.user?.cpf;

    this.http
      .get<any[]>(`${environment.apiUrl}/clientes/gerente/${gerenteCpf}`)
      .pipe(
        map((clientes) =>
          clientes.map((c) => ({
            ...c,
            conta: c.conta?.numeroConta || '',
            saldo: c.conta?.saldo || 0,
            limite: c.conta?.limite || 0,
            cpfGerente: c.gerente?.cpf,
            nomeGerente: c.gerente?.nome,
          }))
        )
      )
      .subscribe((data) => this.clientesSubject.next(data));
  }

  private carregarClientesMock(): ClienteDashboardDTO[] {
    const currentUserJSON = localStorage.getItem('currentUser');
    const contasJSON = localStorage.getItem('contaCliente');

    if (!currentUserJSON || !contasJSON) return [];

    const gerente: Gerente = JSON.parse(currentUserJSON).user;
    const contas: Conta[] = JSON.parse(contasJSON);

    return (gerente.clientes || [])
      .filter((c) => c.status === 'aprovado')
      .map((cliente) => {
        const conta = contas.find((conta) => conta.cliente.cpf === cliente.cpf);

        return {
          ...cliente,
          conta: conta?.numeroConta || '',
          saldo: conta?.saldo || 0,
          limite: conta?.limite || 0,
          cpfGerente: gerente.cpf,
          nomeGerente: gerente.nome,
        };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  updateCliente(cliente: Cliente) {
    if (environment.useMock) {
      const updated = this.mock.updateCliente(cliente);
      this.carregarClientes();
      return of(updated);
    }

    return this.http.put(
      `${environment.apiUrl}/clientes/${cliente.cpf}`,
      cliente
    );
  }

  getClientesPendentes(cpfGerente: string) {
    if (environment.useMock) {
      return of(
        this.mock
          .getClientesDoGerente(cpfGerente)
          .filter((c) => c.status === 'pendente')
      );
    }

    return this.http.get(
      `${environment.apiUrl}/clientes/pendentes/${cpfGerente}`
    );
  }
}
