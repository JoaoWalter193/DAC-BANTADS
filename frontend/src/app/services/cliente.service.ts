import { UserSession } from './../models/user-session.interface';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { MockService } from './mock.service';
import { Cliente } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(
    private mockService: MockService,
    private authService: AuthService
  ) { }

  getClienteLogado(): Cliente | null {
    const userSession = this.authService.getUserSession();
    if (userSession && userSession.user.role === 'CLIENTE') {
      const clientes = this.mockService.getClientes();
      return clientes.find(c => c.cpf === userSession.user.cpf) || null;
    }
    return null;
  }

  updateCliente(cliente: Cliente): Cliente | null {
    const clienteAtualizado = this.mockService.updateCliente(cliente);
    if (clienteAtualizado) {
      this.authService.updateSession(clienteAtualizado);
    }
    return clienteAtualizado;
  }
}
