import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      //validação e para só receber numeros na conta
      account: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    const { account, password } = this.loginForm.value;

    let userData: any = null;

    //mock de login localStorage
    if (account === '11111' && password === 'cliente') {
      userData = {
        id: '111',
        nome: 'Cliente 1',
        account: account,
        role: 'CLIENTE'
      };
    } else if (account === '99999' && password === 'admin') {
      userData = {
        id: '999',
        nome: 'Gerente 1',
        account: account,
        role: 'GERENTE'
      };
    }

      if (userData) {
        this.authService.login(userData);
    } else {
      alert('Número da conta ou senha inválidos.');
    }
  }
}
