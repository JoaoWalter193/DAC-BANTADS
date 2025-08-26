import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { MockService } from '../../services/mock.service';
import { Conta, UserSession } from '../../models';

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
    private authService: AuthService,
    private mockService: MockService
  ) {
    this.loginForm = this.fb.group({
      account: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { account, password } = this.loginForm.value;

    // usa o mockservice para encontrar o user
    const userFound = this.mockService.findUserByCredentials(account, password);

    if (userFound) {
      let conta: Conta | undefined;

      // if user = cliete, busca a conta dele pelo cpf
      if (userFound.role === 'CLIENTE') {
        conta = this.mockService.findContaByClienteCpf(userFound.cpf);
      }

      // monta o objeto do login
      const userSession: UserSession = {
        user: userFound,
        conta: conta
      };
      this.authService.login(userSession);

    } else {
      alert('Email ou senha inválidos.');
    }
  }
}
