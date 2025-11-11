import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storageKey = 'currentUser';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, senha: string): Observable<any | null> {
    const url = `${environment.apiUrl}/login`;

    return this.http.post<any>(url, { email, senha }).pipe(
      tap((resp) => {
        if (resp?.token) {
          this.salvarSessao(resp);
          this.redirecionarPorRole(resp.role);
        }
      }),
      catchError((err) => {
        console.error('Erro no login:', err);
        return of(null);
      })
    );
  }

  private salvarSessao(resp: any) {
    const sessao = {
      token: resp.token,
      role: resp.role,
      usuario: resp.usuario,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(sessao));
  }

  private redirecionarPorRole(role: string) {
    switch (role) {
      case 'CLIENTE':
        this.router.navigate(['/home-cliente']);
        break;

      case 'GERENTE':
        this.router.navigate(['/tela-gerente']);
        break;

      case 'ADMIN':
        this.router.navigate(['/tela-administrador']);
        break;

      default:
        this.router.navigate(['/']);
    }
  }

  getUserSession() {
    const session = localStorage.getItem(this.storageKey);
    return session ? JSON.parse(session) : null;
  }

  getUsuarioLogado() {
    return this.getUserSession()?.usuario ?? null;
  }

  getToken(): string | null {
    return this.getUserSession()?.token ?? null;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['/']);
  }

  isCliente(): boolean {
    return this.getUserSession()?.role === 'CLIENTE';
  }

  isGerente(): boolean {
    return this.getUserSession()?.role === 'GERENTE';
  }

  isAdmin(): boolean {
    return this.getUserSession()?.role === 'ADMIN';
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }
}
