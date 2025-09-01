import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserSession } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  // login-logout com localStorage
  login(userSession: UserSession): void {
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    alert('Login realizado com sucesso!');

    const role = userSession.user.role;

    if (role === 'GERENTE') {
      this.router.navigate(['/tela-administrador']);
    } else if (role === 'CLIENTE') {
      this.router.navigate(['/home-cliente']);
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
