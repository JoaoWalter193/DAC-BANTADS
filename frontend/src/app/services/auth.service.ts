import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  // login-logout com localStorage
  login(userData: any): void {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    alert('Login realizado com sucesso!');

    if (userData.role === 'GERENTE') {
      this.router.navigate(['/tela-administrador']);
    } else if (userData.role === 'CLIENTE') {
      this.router.navigate(['/home-cliente']);
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['']);
  }
}
