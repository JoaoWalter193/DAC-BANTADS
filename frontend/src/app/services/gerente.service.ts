import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gerente } from '../models/gerente.interface';

@Injectable({
  providedIn: 'root'
})
export class GerenteService {
  private apiUrl = 'http://localhost:8080/gerentes';

  constructor(private http: HttpClient) {}

  cadastrarGerente(gerente: Gerente): Observable<Gerente> {
    return this.http.post<Gerente>(`${this.apiUrl}?senha=${gerente.senha}`, gerente);
  }

  listarGerentes(): Observable<Gerente[]> {
    return this.http.get<Gerente[]>(this.apiUrl);
  }
}
