import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { ContaSaldo } from '../models/conta/conta-saldo.interface';
import { ContaOperacaoResponse } from '../models/conta/conta-operacao-response.interface';
import { ContaTransferenciaResponse } from '../models/conta/conta-transferencia-response.interface';
import { ContaExtrato } from '../models/conta/conta-extrato.interface';

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  private api = environment.apiUrl + '/contas';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const currentUserStr = localStorage.getItem('currentUser');
    let token = '';

    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      token = currentUser.token;
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


  // @GetMapping("/{numConta}/saldo")
  obterSaldo(numero: string): Observable<ContaSaldo> {
    return this.http.get<ContaSaldo>(`${this.api}/${numero}/saldo`, {
      headers: this.getHeaders()
    });
  }

  // @PutMapping("/{numConta}/depositar")
  depositar(numero: string, valor: number): Observable<any> {
    return this.http.put<any>(
      `${this.api}/${numero}/depositar`,
      { valor },
      { headers: this.getHeaders() }
    );
  }

  // @PutMapping("/{numConta}/sacar")
  sacar(numero: string, valor: number): Observable<any> {
    return this.http.put<any>(
      `${this.api}/${numero}/sacar`,
      { valor },
      { headers: this.getHeaders() }
    );
  }

  // @PutMapping("/{numConta}/transferir")
  transferir(numeroOrigem: string, destino: string, valor: number): Observable<any> {
    const body = {
      contaDestino: destino,
      valor: valor
    };
    return this.http.put<any>(
      `${this.api}/${numeroOrigem}/transferir`,
      body,
      { headers: this.getHeaders() }
    );
  }

  // @GetMapping("/{numConta}/extrato")
  obterExtrato(numero: string): Observable<ContaExtrato> {
    return this.http.get<ContaExtrato>(`${this.api}/${numero}/extrato`, {
      headers: this.getHeaders()
    });
  }

  // @GetMapping("/{cpf}")
  buscarContaPorCpf(cpf: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${cpf}`, {
      headers: this.getHeaders()
    });
  }
}
