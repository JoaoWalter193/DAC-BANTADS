import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ClienteListaDTO } from '../models/cliente/dto/cliente-lista.dto';
import { ClienteAprovarDTO } from '../models/cliente/dto/cliente-aprovar.dto';
import { ClienteRejeitarDTO } from '../models/cliente/dto/cliente-rejeitar.dto';
import { ClienteDetalhesDTO } from '../models/cliente/dto/cliente-detalhes.dto';
import { ClienteAtualizarDTO } from '../models/cliente/dto/cliente-atualizar.dto';
import { ClienteAutocadastroDTO } from '../models/cliente/dto/cliente-autocadastro.dto';

// Service
// de
// Conta
// tem
// que
// implementar
// conexão
// com
// o
// API
// Gateway
// é isso ai



@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}




  autocadastrar(dto: ClienteAutocadastroDTO): Observable<any> {
    return this.http.post(`${this.api}/clientes`, dto);
  }





  consultarCliente(cpf: string): Observable<ClienteDetalhesDTO> {
    return this.http.get<ClienteDetalhesDTO>(`${this.api}/clientes/${cpf}`);
  }




  
  atualizarCliente(cpf: string, dto: ClienteAtualizarDTO): Observable<any> {
    return this.http.put(`${this.api}/clientes/${cpf}`, dto);
  }




  
  listarClientes(filtro?: string): Observable<ClienteListaDTO[]> {
    if (filtro) {
      return this.http.get<ClienteListaDTO[]>(
        `${this.api}/clientes?filtro=${filtro}`
      );
    }
    return this.http.get<ClienteListaDTO[]>(`${this.api}/clientes`);
  }



  
  aprovarCliente(cpf: string): Observable<ClienteAprovarDTO> {
    return this.http.post<ClienteAprovarDTO>(
      `${this.api}/clientes/${cpf}/aprovar`,
      {}
    );
  }





  rejeitarCliente(cpf: string, dto: ClienteRejeitarDTO): Observable<any> {
    return this.http.post(`${this.api}/clientes/${cpf}/rejeitar`, dto);
  }
}
