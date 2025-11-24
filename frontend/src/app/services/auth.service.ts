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
        console.log('🔍 Resposta do login:', resp);
        if (resp?.access_token) {
          this.salvarSessao(resp);
          this.decodeToken(resp.access_token);
        }
      }),
      catchError((err) => {
        console.error('Erro no login:', err);
        return of(null);
      })
    );
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      console.log('🔍 Token decodificado no frontend:', decoded);
      return decoded;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  private salvarSessao(resp: any) {
    const tokenData = this.decodeToken(resp.access_token);

    const sessao = {
      token: resp.access_token,
      role:
        resp.tipo ||
        resp.role ||
        tokenData?.scope?.replace('ROLE_', '') ||
        tokenData?.role,
      usuario: resp.usuario || resp.email || tokenData?.email,
      id: resp.id || resp.sub || tokenData?.sub,
    };

    console.log('🔍 Sessão salva:', sessao);
    localStorage.setItem(this.storageKey, JSON.stringify(sessao));
  }

  getToken(): string | null {
    const session = this.getUserSession();
    return session?.token || null;
  }

  getUserSession() {
    const session = localStorage.getItem(this.storageKey);
    return session ? JSON.parse(session) : null;
  }

  getUsuarioLogado() {
    return this.getUserSession()?.usuario ?? null;
  }

  getRole(): string | null {
    return this.getUserSession()?.role ?? null;
  }

  logout(): void {
    console.log('🔍 Efetuando logout');
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['/']);
  }

  isCliente(): boolean {
    return this.getRole() === 'CLIENTE';
  }

  isGerente(): boolean {
    return this.getRole() === 'GERENTE';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMINISTRADOR';
  }

  estaAutenticado(): boolean {
    const token = this.getToken();
    const hasToken = !!token;
    console.log('🔍 Verificação de autenticação:', hasToken);
    return hasToken;
  }

  getCPF(): string | null {
    const token = this.getToken();
    if (token) {
      const tokenData = this.decodeToken(token);
      console.log(
        '🔍 Buscando CPF no token. Campos disponíveis:',
        Object.keys(tokenData)
      );

      const cpf = tokenData?.cpf;

      if (cpf && this.isValidCPF(cpf)) {
        console.log('✅ CPF encontrado no token:', cpf);
        return cpf;
      } else {
        console.log('❌ CPF não encontrado ou inválido no token:', cpf);
      }
    }

    return null;
  }

  private isValidCPF(cpf: string): boolean {
    const cpfRegex = /^\d{11}$/;
    return cpfRegex.test(cpf);
  }
}
