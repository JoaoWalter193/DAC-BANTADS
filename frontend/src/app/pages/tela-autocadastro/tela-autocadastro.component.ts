import { AfterViewInit, Component } from '@angular/core';
import {
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { ClienteAutocadastroDTO } from '../../models/cliente/dto/cliente-autocadastro.dto';

@Component({
  selector: 'app-tela-autocadastro',
  imports: [FormsModule, CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './tela-autocadastro.component.html',
  styleUrl: './tela-autocadastro.component.css',
})
export class TelaAutocadastroComponent implements AfterViewInit {
  cadastroForm: FormGroup;

  mensagem: string = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';
  carregando: boolean = false;

  constructor(private fb: FormBuilder, private clienteService: ClienteService) {
    this.cadastroForm = this.fb.group({
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      salario: ['', [Validators.required, Validators.min(0.01)]],
      endereco: ['', Validators.required],
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, Validators.maxLength(2)]],
    });
  }

  formatarNumero(event: any) {}

  formatarCEP(event: any) {}

  formatarSalario(event: any) {}

  formatarCPF(event: any) {}

  formatarTelefone(event: any) {}

  ngAfterViewInit() {}

  async onSubmit() {
    this.cadastroForm.markAllAsTouched();

    if (!this.cadastroForm.valid) {
      this.mostrarMensagem(
        'Por favor, preencha todos os campos obrigatórios corretamente.',
        'erro'
      );
      return;
    }

    const form = this.cadastroForm.value;

    const dto: ClienteAutocadastroDTO = {
      cpf: form.cpf,
      nome: form.nome,
      email: form.email,
      salario: parseFloat(
        form.salario.toString().replace(/\./g, '').replace(',', '.')
      ),
      endereco: form.endereco,
      CEP: form.cep,
      cidade: form.cidade,
      estado: form.estado,
    };

    this.carregando = true;

    try {
      await this.clienteService.autocadastrar(dto).toPromise();
      this.mostrarMensagem(
        'Solicitação enviada com sucesso! Aguarde a aprovação do gerente.',
        'sucesso'
      );
      this.cadastroForm.reset();
    } catch (error: any) {
      if (error.status === 409) {
        this.mostrarMensagem(
          'Cliente já cadastrado ou aguardando aprovação (CPF duplicado).',
          'erro'
        );
      } else {
        this.mostrarMensagem(
          'Erro ao enviar cadastro. Tente novamente.',
          'erro'
        );
      }
    } finally {
      this.carregando = false;
    }
  }

  mostrarMensagem(mensagem: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;

    setTimeout(() => {
      this.mensagem = '';
      this.tipoMensagem = '';
    }, 5000);
  }
}
