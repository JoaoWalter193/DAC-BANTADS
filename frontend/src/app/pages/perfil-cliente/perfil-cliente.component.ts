import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { MatButton } from "@angular/material/button";

@Component({
  selector: 'app-perfil-cliente',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, NavbarComponent, ReactiveFormsModule, MatButton],
  templateUrl: './perfil-cliente.component.html',
  styleUrl: './perfil-cliente.component.css'
})
export class PerfilClienteComponent implements OnInit {
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { // incia a estrutura do formulário com dados vazios
    this.profileForm = this.fb.group({
      nome: [''],
      email: [''],
      cpf: [{ value: '', disabled: true }],
      telefone: [''],
      salario: [''],
      endereco: this.fb.group({
        tipo: [''],
        logradouro: [''],
        numero: [''],
        complemento: [''],
        cep: [''],
        cidade: [''],
        estado: [''],
      })
    })
  }
  ngOnInit(): void {
    const currentUser = this.authService.getUsuarioLogado();

    if (currentUser) {
      // preenche o formulário
      this.profileForm.patchValue(currentUser);
    }
  }

  onSave(): void {
    if (this.profileForm.valid) {
      console.log("Dados a serem salvos: ", this.profileForm.getRawValue());
    }
  }

}
