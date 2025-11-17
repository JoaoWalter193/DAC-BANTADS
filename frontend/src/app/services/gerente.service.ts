import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Gerente } from '../models/gerente/gerente.interface';
import { MockService } from './mock.service';
import { GerenteDashboardDTO } from '../models/gerente/dto/gerente-dashboard.dto';
import { environment } from '../environments/environment';
import { CriarGerenteDTO } from '../models/gerente/dto/gerente-criar.dto';
import { AtualizarGerenteDTO } from '../models/gerente/dto/gerente-atualizar.dto';

@Injectable({
  providedIn: 'root',
})
export class GerenteService {
  private readonly baseUrl = `${environment.apiUrl}/gerentes`;

  constructor(private http: HttpClient, private mock: MockService) {}

  getGerentes(numero?: 'dashboard') {
    const params = numero ? { numero } : undefined;
    return this.http.get<Gerente[] | GerenteDashboardDTO[]>(this.baseUrl, {
      params,
    });
  }

  getGerenteByCpf(cpf: string) {
    return this.http.get<Gerente>(`${this.baseUrl}/${cpf}`);
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
