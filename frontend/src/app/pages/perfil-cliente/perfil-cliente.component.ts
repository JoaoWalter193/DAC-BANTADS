import { Component, OnInit } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { ClienteService } from '../../services/cliente.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ClienteAutocadastroDTO } from '../../models/cliente/dto/cliente-autocadastro.dto';
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
    MatButtonModule,
    CommonModule,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
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
    private authService: AuthService,
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
      cep: ['', [Validators.required]],

      // Campos informativos (desabilitados)
      conta: [{ value: '', disabled: true }],
      saldo: [{ value: '', disabled: true }],
      limite: [{ value: '', disabled: true }],
      gerente: [{ value: '', disabled: true }],
      gerente_nome: [{ value: '', disabled: true }],
      gerente_email: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    // 1. Pega o usuário logado para obter o CPF
    const usuarioLogado = this.authService.getUsuarioLogado();

    if (usuarioLogado && usuarioLogado.cpf) {
      // 2. Faz a chamada ao serviço e se inscreve (subscribe)
      this.clienteService.consultarCliente(usuarioLogado.cpf).subscribe({
        next: (dados) => {
          this.cliente = dados; // AQUI é onde preenchemos o this.cliente

          // Preenche o formulário com os dados vindos do banco
          this.profileForm.patchValue({
            ...dados,
            // Garante que o campo de endereço seja preenchido mesmo se o back mandar 'logradouro'
            endereco: dados.endereco || (dados as any).logradouro,
          });
        },
        error: (err) => {
          console.error('Erro ao carregar perfil:', err);
          this.status = 'Erro ao carregar dados do cliente.';
        },
      });
    } else {
      this.status = 'Usuário não autenticado.';
    }
  }

  onSave(): void {
    if (!this.profileForm.valid) {
      this.status = 'Preencha todos os campos obrigatórios';
      return;
    }

    if (!this.cliente) {
      this.status = 'Erro: Dados do cliente não carregados.';
      return;
    }

    const dadosForm = this.profileForm.getRawValue();

    // Cria o objeto DTO combinando os dados originais com os do formulário
    const clienteAtualizado: ClienteAutocadastroDTO = {
      ...this.cliente,
      ...dadosForm,
    };

    // Chama o serviço de atualização e se inscreve na resposta
    this.clienteService
      .atualizarCliente(this.cliente.cpf, clienteAtualizado)
      .subscribe({
        next: () => {
          this.status = 'Perfil atualizado com sucesso!';
        },
        error: (err) => {
          console.error('Erro ao atualizar:', err);
          this.status = 'Erro ao atualizar perfil. Tente novamente.';
        },
      });
  }

  voltar(): void {
    this.location.back();
  }
}
