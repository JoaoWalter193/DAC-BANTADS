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
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    const { email, password } = this.loginForm.value;

    let userData: any = null;

    //mock de login localStorage
    if (email === 'cli1@bantads.com.br' && password === 'tads') {
      userData = {
        cpf: '12912861012',
        nome: 'Catharyna',
        email: email,
        role: 'CLIENTE',
        salario: 10000,
        endereco: "rua da catharyna"
      };
    } else if (email === 'cli2@bantads.com.br' && password === 'tads') {
      userData = {
        cpf: '09506382000',
        nome: 'Cleuddônio',
        email: email,
        role: 'CLIENTE',
        salario: 20000,
        endereco: "rua do cleuddonio"
      };
    } else if (email === 'ger1@bantads.com.br' && password === 'tads') {
      userData = {
        cpf: '98574307084',
        nome: 'Geniéve',
        email: email,
        role: 'GERENTE'
      };
    } else if (email === 'adm1@bantads.com.br' && password === 'tads') {
      userData = {
        cpf: '40501740066',
        nome: 'Adamântio',
        email: email,
        role: 'ADMIN'
      };
    }

      if (userData) {
        this.authService.login(userData);
    } else {
      alert('Email ou senha inválidos.');
    }
  }
}
