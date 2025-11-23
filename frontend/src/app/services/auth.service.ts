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

  login(email: string, password: string): Observable<any | null> {
    const url = `${environment.apiUrl}/login`;

    return this.http.post<any>(url, { email, password }).pipe(
      tap((resp) => {
        if (resp?.access_token) {
          this.salvarSessao(resp);
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
      token: resp.access_token,
      role: resp.tipo,
      usuario: resp.usuario,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(sessao));
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
    return this.getUserSession()?.role === 'ADMINISTRADOR';
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }
}
