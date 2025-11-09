import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError } from 'rxjs';
import { MockService } from './mock.service';
import { LoginResponse } from '../models/auth/login-response.interface';
import { environment } from '../environments/environment';
import { UserSession } from '../models/auth/user-session.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storageKey = 'currentUser';

  constructor(
    private http: HttpClient,
    private router: Router,
    private mockService: MockService
  ) {}

  login(email: string, senha: string): Observable<LoginResponse | null> {
    // ✅ Ambiente de teste usando mock
    if (environment.useMockService) {
      const user = this.mockService.autenticarUsuario(email, senha);

      if (!user) return of(null);

      const fake: LoginResponse = {
        access_token: 'MOCK_TOKEN',
        token_type: 'bearer',
        tipo: user.role || 'CLIENTE',
        usuario: user,
      };

      this.salvarSessao(fake);
      this.redirecionarPorTipo(fake.tipo);

      return of(fake);
    }

    // ✅ Login real via Gateway
    const url = `${environment.apiUrl}/login`;

    return this.http.post<LoginResponse>(url, { email, senha }).pipe(
      tap((resp) => {
        if (resp?.access_token) {
          this.salvarSessao(resp);
          this.redirecionarPorTipo(resp.tipo);
        }
      }),
      catchError((err) => {
        console.error('Erro no login:', err);
        return of(null);
      })
    );
  }

  private salvarSessao(resp: LoginResponse) {
    const sessao: UserSession = {
      token: resp.access_token,
      tipo: resp.tipo,
      usuario: resp.usuario,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(sessao));
  }

  private redirecionarPorTipo(tipo: string) {
    switch (tipo) {
      case 'CLIENTE':
        this.router.navigate(['/home-cliente']);
        break;

      case 'GERENTE':
        this.router.navigate(['/tela-gerente']);
        break;

      case 'ADMINISTRADOR':
        this.router.navigate(['/tela-administrador']);
        break;

      default:
        this.router.navigate(['']);
    }
  }

  getUserSession(): UserSession | null {
    const session = localStorage.getItem(this.storageKey);
    return session ? JSON.parse(session) : null;
  }

  getUsuarioLogado() {
    return this.getUserSession()?.usuario ?? null;
  }

  getToken(): string | null {
    return this.getUserSession()?.token ?? null;
  }

  atualizarSessao(usuarioAtualizado: any): void {
    const session = this.getUserSession();
    if (session) {
      session.usuario = usuarioAtualizado;
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    }
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['']);
  }

  isCliente(): boolean {
    return this.getUserSession()?.tipo === 'CLIENTE';
  }

  isGerente(): boolean {
    return this.getUserSession()?.tipo === 'GERENTE';
  }

  isAdmin(): boolean {
    return this.getUserSession()?.tipo === 'ADMINISTRADOR';
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }
}
