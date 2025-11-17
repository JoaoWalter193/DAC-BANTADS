import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      account: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { account, password } = this.loginForm.value;

    this.authService.login(account, password).subscribe({
      next: (resp) => {
        if (!resp || !resp.token) {
          alert('Credenciais inválidas.');
          return;
        }

        switch (resp.role) {
          case 'CLIENTE':
            this.router.navigate(['/cliente/dashboard']);
            break;

          case 'GERENTE':
            this.router.navigate(['/gerente/pendentes']);
            break;

          case 'ADMIN':
            this.router.navigate(['/admin/painel']);
            break;

          default:
            alert('Role desconhecida.');
        }
      },
      error: () => {
        alert('Erro ao tentar logar. Verifique as credenciais.');
      },
    });
  }
}
