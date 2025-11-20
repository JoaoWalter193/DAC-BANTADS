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
import { ClienteAutocadastroDTO } from '../../models/cliente/dto/cliente-autocadastro.dto';
import { ClienteAtualizarDTO } from '../../models/cliente/dto/cliente-atualizar.dto';
import { ClienteDetalhesDTO } from '../../models/cliente/dto/cliente-detalhes.dto';

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
  private cliente!: ClienteDetalhesDTO;
  public status: string = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private location: Location
  ) {
    this.profileForm = this.fb.group({
      cpf: [{ value: '', disabled: true }],
      nome: ['', [Validators.required]],
      endereco: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      salario: ['', [Validators.required, Validators.min(0)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      conta: [{ value: '', disabled: true }],
      saldo: [{ value: '', disabled: true }],
      limite: [{ value: '', disabled: true }],
      gerente: [{ value: '', disabled: true }],
      gerente_nome: [{ value: '', disabled: true }],
      gerente_email: [{ value: '', disabled: true }],
    });
  }
  ngOnInit(): void {
    const currentUser = this.clienteService.consultarCliente(
      this.cliente?.cpf || ''
    );

    if (currentUser) {
      this.profileForm.patchValue(currentUser);
    }
  }

  onSave(): void {
    if (!this.profileForm.valid) {
      this.status = 'Preencha todos os campos obrigatórios';
      return;
    }

    const dadosForm = this.profileForm.getRawValue();
    const clienteAtualizado: ClienteAutocadastroDTO = {
      ...this.cliente,
      ...dadosForm,
    };

    this.clienteService.atualizarCliente(this.cliente.cpf, clienteAtualizado);
  }

  voltar(): void {
    this.location.back();
  }
}
