import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Gerente {
  cpf: string;
  nome: string;
  email: string;
  tipo: 'GERENTE' | 'ADMINISTRADOR';
}

interface GerenteDashboardDTO {
  gerente: {
    cpf: string;
    nome: string;
    email: string;
    tipo: string;
  };
  clientes: any[];
  saldo_positivo: number;
  saldo_negativo: number;
}
interface ClienteGerente {
  cpf: string;
  nome: string;
  cidade: string;
  estado: string;
  saldo: number;
  limite: number;
  link_detalhes: string;
}

export interface CriarGerenteDTO {
  nome: string;
  email: string;
  cpf: string;
}

export interface AtualizarGerenteDTO {
  nome?: string;
  email?: string;
  tipo?: 'GERENTE' | 'ADMINISTRADOR';
}

@Injectable({
  providedIn: 'root',
})
export class GerenteService {
  private readonly baseUrl = `${
    environment.apiUrl || 'http://localhost:3000'
  }/gerentes`;

  constructor(private http: HttpClient) {}

  getGerentes(filtro?: 'dashboard'): Observable<GerenteDashboardDTO[]> {
    const params = filtro ? { filtro } : undefined;
    return this.http.get<GerenteDashboardDTO[]>(this.baseUrl, {
      params,
    });
  }

  getGerenteByCpf(cpf: string): Observable<Gerente> {
    return this.http.get<Gerente>(`${this.baseUrl}/${cpf}`);
  }

  getClientesDoGerente(
    cpfGerente: string,
    busca?: string
  ): Observable<ClienteGerente[]> {
    const params = busca ? { busca } : undefined;
    return this.http.get<ClienteGerente[]>(
      `${this.baseUrl}/${cpfGerente}/clientes`,
      { params }
    );
  }

  criarGerente(dto: CriarGerenteDTO): Observable<Gerente> {
    return this.http.post<Gerente>(this.baseUrl, dto);
  }

  atualizarGerente(cpf: string, dto: AtualizarGerenteDTO): Observable<Gerente> {
    return this.http.put<Gerente>(`${this.baseUrl}/${cpf}`, dto);
  }

  removerGerente(cpf: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${cpf}`);
  }
}
