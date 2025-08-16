import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      //validação e para só receber numeros na conta
      account: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    const { account, password } = this.loginForm.value;

    //mock de login localStorage
    if (account === '12345' && password === '123456') {
      const userData = {
        id: '456',
        nome: 'Cliente 1',
        account: account,
        token: 'asd-asd-asd'
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      alert('Login realizado com sucesso!');
      this.router.navigate(['/tela-cliente']);
    } else {
      alert('Número da conta ou senha inválidos.');
    }
  }
}
