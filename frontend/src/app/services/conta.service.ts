import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
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

  obterSaldo(numero: string) {
    return this.http.post<ContaSaldo>(`${this.api}/${numero}/saldo`, {});
  }

  depositar(numero: string, valor: number) {
    return this.http.post<ContaOperacaoResponse>(
      `${this.api}/${numero}/depositar`,
      { valor }
    );
  }

  sacar(numero: string, valor: number) {
    return this.http.post<ContaOperacaoResponse>(
      `${this.api}/${numero}/sacar`,
      { valor }
    );
  }

  transferir(numeroOrigem: string, destino: string, valor: number) {
    return this.http.post<ContaTransferenciaResponse>(
      `${this.api}/${numeroOrigem}/transferir`,
      {
        destino,
        valor,
      }
    );
  }

  obterExtrato(numero: string) {
    return this.http.post<ContaExtrato>(`${this.api}/${numero}/extrato`, {});
  }
}
