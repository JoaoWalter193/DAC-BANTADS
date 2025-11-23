import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Gerente } from '../models/gerente/gerente.interface';
import { GerenteDashboardDTO } from '../models/gerente/dto/gerente-dashboard.dto';
import { environment } from '../environments/environment';
import { CriarGerenteDTO } from '../models/gerente/dto/gerente-criar.dto';
import { AtualizarGerenteDTO } from '../models/gerente/dto/gerente-atualizar.dto';

// Interface para o cliente do gerente (conforme a resposta da API)
export interface ClienteGerente {
  cpf: string;
  nome: string;
  cidade: string;
  estado: string;
  saldo: number;
  limite: number;
  link_detalhes: string;
}

@Injectable({
  providedIn: 'root',
})
export class GerenteService {
  private readonly baseUrl = `${environment.apiUrl}/gerentes`;

  constructor(private http: HttpClient) {}

  getGerentes(filtro?: 'dashboard') {
    const params = filtro ? { filtro } : undefined;
    return this.http.get<GerenteDashboardDTO[]>(this.baseUrl, {
      params,
    });
  }

  getGerenteByCpf(cpf: string) {
    return this.http.get<Gerente>(`${this.baseUrl}/${cpf}`);
  }

  getClientesDoGerente(cpfGerente: string, busca?: string) {
    const params = busca ? { busca } : undefined;
    return this.http.get<ClienteGerente[]>(
      `${this.baseUrl}/${cpfGerente}/clientes`,
      { params }
    );
  }

  criarGerente(dto: CriarGerenteDTO) {
    return this.http.post<Gerente>(this.baseUrl, dto);
  }

  atualizarGerente(cpf: string, dto: AtualizarGerenteDTO) {
    return this.http.put<Gerente>(`${this.baseUrl}/${cpf}`, dto);
  }

  removerGerente(cpf: string) {
    return this.http.delete(`${this.baseUrl}/${cpf}`);
  }
}
