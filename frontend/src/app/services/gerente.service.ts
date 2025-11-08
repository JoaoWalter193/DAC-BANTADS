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
    if (environment.useMockService) {
      if (numero === 'dashboard') {
        return of(
          this.mock.getGerentes().map(
            (g) =>
              ({
                gerente: g,
                clientes:
                  g.clientes?.map((c) => ({
                    cliente: c.cpf,
                    numero: 'MOCK',
                    saldo: 100,
                    limite: 1000,
                    gerente: g.cpf,
                    criacao: new Date().toISOString(),
                  })) || [],
                saldo_positivo: 10000,
                saldo_negativo: -500,
              } as GerenteDashboardDTO)
          )
        );
      }

      return of(this.mock.getGerentes());
    }

    const params = numero ? { numero } : undefined;
    return this.http.get<Gerente[] | GerenteDashboardDTO[]>(this.baseUrl, {
      params,
    });
  }

  getGerenteByCpf(cpf: string) {
    if (environment.useMockService) {
      return of(this.mock.getGerentes().find((g) => g.cpf === cpf) || null);
    }

    return this.http.get<Gerente>(`${this.baseUrl}/${cpf}`);
  }

  criarGerente(dto: CriarGerenteDTO) {
    if (environment.useMockService) {
      const gerente: Gerente = {
        cpf: dto.cpf,
        nome: dto.nome,
        email: dto.email,
        tipo: dto.tipo,
        clientes: [],
      };
      this.mock.getGerentes().push(gerente);
      return of(gerente);
    }

    return this.http.post<Gerente>(this.baseUrl, dto);
  }

  atualizarGerente(cpf: string, dto: AtualizarGerenteDTO) {
    if (environment.useMockService) {
      const ger = this.mock.getGerentes().find((g) => g.cpf === cpf);
      if (ger) Object.assign(ger, dto);
      return of(ger);
    }

    return this.http.put<Gerente>(`${this.baseUrl}/${cpf}`, dto);
  }

  removerGerente(cpf: string) {
    if (environment.useMockService) {
      const arr = this.mock.getGerentes();
      const i = arr.findIndex((g) => g.cpf === cpf);
      if (i !== -1) arr.splice(i, 1);
      return of(true);
    }

    return this.http.delete(`${this.baseUrl}/${cpf}`);
  }
}
