import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { ClienteService } from '../../services/cliente.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Cliente } from '../../models/cliente/cliente.interface';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    NavbarComponent,
    ReactiveFormsModule,
    MatButton,
    CommonModule,
    NgxMaskDirective,
  ],
  templateUrl: './perfil-cliente.component.html',
  styleUrl: './perfil-cliente.component.css',
})
export class PerfilClienteComponent implements OnInit {
  profileForm: FormGroup;
  private cliente: Cliente | null = null;
  public status: string = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private location: Location
  ) {
    // incia a estrutura do formulário com dados vazios
    this.profileForm = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cpf: [{ value: '', disabled: true }],
      telefone: ['', [Validators.required]],
      salario: ['', [Validators.required]],
      endereco: this.fb.group({
        tipo: ['', [Validators.required]],
        logradouro: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        complemento: [''],
        CEP: ['', [Validators.required]],
        cidade: ['', [Validators.required]],
        estado: ['', [Validators.required]],
      }),
    });
  }
  ngOnInit(): void {
    const currentUser = this.clienteService.getClienteLogado();

    if (currentUser) {
      // preenche o formulário
      this.profileForm.patchValue(currentUser);
    }
  }

  onSave(): void {
    if (!this.profileForm.valid) {
      this.status = 'Preencha todos os campos obrigatórios';
      return;
    }

    const dadosForm = this.profileForm.getRawValue();
    const clienteAtualizado: Cliente = {
      ...this.cliente,
      ...dadosForm,
      endereco: {
        ...this.cliente?.endereco,
        ...dadosForm.endereco,
      },
    };

    console.log('Dados a serem salvos: ', clienteAtualizado);
    const clienteNovo = this.clienteService.updateCliente(clienteAtualizado);

    if (clienteNovo) {
      this.cliente = clienteNovo;
      this.status = 'Cliente atualizado';
    }
  }

  voltar(): void {
    this.location.back();
  }
}
