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
    this.router.navigate(['/tela-cliente']);
    alert('Login realizado com sucesso!');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['']);
  }
}
