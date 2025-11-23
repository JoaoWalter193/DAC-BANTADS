import { AfterViewInit, Component } from '@angular/core';
import {
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { ClienteAutocadastroDTO } from '../../models/cliente/dto/cliente-autocadastro.dto';

@Component({
  selector: 'app-tela-autocadastro',
  imports: [FormsModule, CommonModule, RouterLink, ReactiveFormsModule],
  providers: [CurrencyPipe],
  templateUrl: './tela-autocadastro.component.html',
  styleUrl: './tela-autocadastro.component.css',
})
export class TelaAutocadastroComponent implements AfterViewInit {
  cadastroForm: FormGroup;

  mensagem: string = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';
  carregando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private currencyPipe: CurrencyPipe
  ) {
    this.cadastroForm = this.fb.group({
      cpf: ['', Validators.required],
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      salario: [0, [Validators.required, Validators.min(0.01)]],
      cep: ['', [Validators.required]],
      endereco: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]],
      complemento: [''],
    });
  }

  formatarCEP(event: any) {
    let cep = event.target.value.replace(/\D/g, '');

    if (cep.length > 5) {
      cep = cep.substring(0, 5) + '-' + cep.substring(5, 8);
    }

    event.target.value = cep;
    this.cadastroForm.get('cep')?.setValue(cep, { emitEvent: false });

    if (cep.replace('-', '').length === 8) {
      this.buscarCEP(cep.replace('-', ''));
    }
  }

  buscarCEP(cep: string) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((res) => res.json())
      .then((dados) => {
        if (dados.erro) {
          this.mostrarMensagem('CEP não encontrado.', 'erro');
          return;
        }

        this.cadastroForm.patchValue({
          endereco: dados.logradouro || '',
          cidade: dados.localidade || '',
          estado: dados.uf || '',
        });
      })
      .catch(() => {
        this.mostrarMensagem('Erro ao consultar o CEP.', 'erro');
      });
  }

  permitirSomenteNumeros(event: KeyboardEvent): void {
    const teclasPermitidas = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ];

    if (
      teclasPermitidas.includes(event.key) ||
      (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
    ) {
      return;
    }

    const ehNumero = /^[0-9]$/.test(event.key);

    if (!ehNumero) {
      event.preventDefault();
    }
  }

  formatarSalario(event: any) {
    const input = event.target;
    const apenasNumeros = input.value.replace(/\D/g, '');

    const valorNumerico = Number(apenasNumeros) / 100;

    this.cadastroForm
      .get('salario')
      ?.setValue(valorNumerico, { emitEvent: false });

    input.value = this.currencyPipe.transform(
      valorNumerico,
      'BRL',
      'symbol',
      '1.2-2'
    );
  }

  formatarCPF(event: any) {
    let cpf = event.target.value.replace(/\D/g, '');

    if (cpf.length > 11) {
      cpf = cpf.substring(0, 11);
    }

    if (cpf.length > 9) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpf.length > 6) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
      cpf = cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    event.target.value = cpf;
    this.cadastroForm.get('cpf')?.setValue(cpf, { emitEvent: false });
  }

  validarCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');

    if (!cpf || cpf.length !== 11) return false;

    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let dig1 = 11 - (soma % 11);
    if (dig1 >= 10) dig1 = 0;

    if (dig1 !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    let dig2 = 11 - (soma % 11);
    if (dig2 >= 10) dig2 = 0;

    return dig2 === parseInt(cpf[10]);
  }

  ngAfterViewInit() {
    const ctrl = this.cadastroForm.get('salario');
    if (ctrl) ctrl.setValue(0, { emitEvent: false });

    const input = document.querySelector(
      'input[formControlName="salario"]'
    ) as HTMLInputElement;
    if (input) input.value = 'R$ 0,00';
  }

  async onSubmit() {
    this.cadastroForm.markAllAsTouched();

    let cpf = this.cadastroForm.get('cpf')?.value ?? '';
    cpf = cpf.replace(/\D/g, '');

    if (!this.validarCPF(cpf)) {
      this.mostrarMensagem('CPF inválido.', 'erro');
      return;
    }

    if (!this.cadastroForm.valid) {
      this.mostrarMensagem(
        'Por favor, preencha todos os campos obrigatórios corretamente.',
        'erro'
      );
      return;
    }

    let valorSalario = this.cadastroForm.get('salario')?.value;

    if (typeof valorSalario === 'string') {
      valorSalario = valorSalario
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .replace(/[^0-9.]/g, '');
    }

    valorSalario = Number(valorSalario);

    if (isNaN(valorSalario) || valorSalario <= 0) {
      this.mostrarMensagem('Salário inválido.', 'erro');
      return;
    }

    const form = this.cadastroForm.value;

    const dto: ClienteAutocadastroDTO = {
      cpf: cpf,
      email: form.email,
      nome: form.nome,
      salario: valorSalario,
      endereco: form.endereco,
      cep: form.cep.replace(/\D/g, ''),
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
