import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserSession } from '../models';
import { MockService } from './mock.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private mockService: MockService) { }

  // login-logout com localStorage
  login(email: string, password: string): void {
    const user = this.mockService.autenticarUsuario(email, password);


    if (user) {
      let conta;
      if (user.role === 'CLIENTE') {
        conta = this.mockService.findContaCpf(user.cpf);
      }
      const userSession: UserSession = { user, conta };
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      alert('Login realizado com sucesso!');

      const role = user.role;
      if (role === 'GERENTE') {
        this.router.navigate(['/tela-administrador']);
      } else if (role === 'CLIENTE') {
        this.router.navigate(['/home-cliente']);
      }
    } else {
      alert('Email ou senha inválidos.');
    }
  }

  getUserSession(): UserSession | null {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  }

  // buscar usuário logado para usar em outros componentes
  getUsuarioLogado() {
    const session = this.getUserSession();
    return session ? session.user : null;
  }

  // atualizar sessao depois de editar perfil de cliente
  updateSession(clienteAtualizado: any): void {
    const session = this.getUserSession();
    if (session) {
      session.user = clienteAtualizado;
      localStorage.setItem('currentUser', JSON.stringify(session))
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['']);
  }
}
