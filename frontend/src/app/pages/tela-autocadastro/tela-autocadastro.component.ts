import { AfterViewInit, Component } from '@angular/core';
import {
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../models/cliente.interface';
import { RouterLink } from '@angular/router';
import { MockService } from '../../services/mock.service';

@Component({
  selector: 'app-tela-autocadastro',
  imports: [FormsModule, CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './tela-autocadastro.component.html',
  styleUrl: './tela-autocadastro.component.css',
})
export class TelaAutocadastroComponent implements AfterViewInit {
  cliente = {
    cpf: '',
    nome: '',
    email: '',
    salario: 0,
    telefone: '',
    endereco: {
      tipo: '',
      logradouro: '',
      numero: 0,
      complemento: '',
      CEP: '',
      cidade: '',
      estado: '',
    },
  };

  mensagem: string = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';
  carregando: boolean = false;
  cadastroForm: FormGroup;

  private atualizandoCPF: boolean = false;

  constructor(private fb: FormBuilder, private mockService: MockService) {
    this.cadastroForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      cpf: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/),
          this.validarCPF(),
        ],
      ],
      telefone: [
        '',
        [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)],
      ],
      salario: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(0.01),
          Validators.max(100000.0),
        ]),
      ],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}\-\d{3}$/)]],
      tipo: ['', Validators.required],
      logradouro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(2)]),
      ],
      numero: ['', [Validators.required, Validators.min(1)]],
      complemento: [''],
    });
  }

  ngAfterViewInit() {
    this.cadastroForm.get('salario')?.valueChanges.subscribe((salario) => {
      if (salario === null || salario === undefined) return; // Guarda de segurança

      if (salario < 0) {
        this.cadastroForm.get('salario')?.setValue(0, { emitEvent: false });
      }

      // Converte para string apenas se não for nulo
      const cleanedSalario = salario.toString().replace(/\D/g, '');
      const valorMaximo = 10000000;

      if (parseFloat(cleanedSalario) > valorMaximo) {
        this.cadastroForm
          .get('salario')
          ?.setValue(valorMaximo, { emitEvent: false });
      }
    });
  }

  formatarCPF(event: any) {
    const control = this.cadastroForm.get('cpf');
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length >= 10) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length >= 7) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length >= 4) {
      value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    control?.setValue(value, { emitEvent: false });
  }

  formatarSalario(event: any) {
    const control = this.cadastroForm.get('salario');
    let value = event.target.value.replace(/\D/g, '');
    if (value.length === 0) {
      control?.setValue('', { emitEvent: false });
      return;
    }
    let numero = parseFloat(value) / 100;
    if (numero > 100000.0) {
      numero = 100000.0;
    }
    const partes = numero.toFixed(2).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const valorFormatado = partes.join(',');
    control?.setValue(valorFormatado, { emitEvent: false });
  }

  formatarCEP(event: any) {
    const control = this.cadastroForm.get('cep');
    let value = event.target.value.replace(/\D/g, '');
    if (value.length === 0) {
      control?.setValue('', { emitEvent: false });
      return;
    }
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    if (value.length === 9) {
      this.buscarEnderecoPorCEP();
    }
    control?.setValue(value, { emitEvent: false });
  }

  formatarNumero(event: any) {
    const control = this.cadastroForm.get('numero');
    let value = event.target.value.replace(/\D/g, '');
    if (value.length === 0) {
      control?.setValue(value, { emitEvent: false });
      return;
    }
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    control?.setValue(value, { emitEvent: false });
  }

  onSubmit() {
    this.cadastroForm.markAllAsTouched();

    if (!this.cadastroForm.valid) {
      this.mostrarMensagem(
        'Por favor, preencha todos os campos obrigatórios corretamente.',
        'erro'
      );
      return;
    }

    this.carregando = true;

    setTimeout(() => {
      const formValues = this.cadastroForm.getRawValue();

      const clienteCompleto: Cliente = {
        cpf: formValues.cpf.replace(/\D/g, ''),
        nome: formValues.nome,
        email: formValues.email,
        salario: parseFloat(
          formValues.salario.replace(/\./g, '').replace(',', '.')
        ),
        endereco: {
          tipo: formValues.tipo,
          logradouro: formValues.logradouro,
          numero: formValues.numero,
          complemento: formValues.complemento,
          CEP: formValues.cep.replace(/\D/g, ''),
          cidade: formValues.cidade,
          estado: formValues.estado,
        },
        telefone: formValues.telefone.replace(/\D/g, ''),
        status: 'pendente',
        dataSolicitacao: new Date(),
        role: 'CLIENTE',
        senha: '',
      };

      const sucesso = this.mockService.addClienteAoGerente(clienteCompleto);

      this.carregando = false;

      if (!sucesso) {
        this.mostrarMensagem(
          'CPF já cadastrado. Não é possível fazer uma novo cadastro.',
          'erro'
        );
      } else {
        this.mostrarMensagem(
          'Solicitação de cadastro enviada com sucesso! Aguarde a aprovação do gerente.',
          'sucesso'
        );
        this.limparFormulario();
      }
    }, 1500);
  }

  validarCPF() {
    return (control: AbstractControl): ValidationErrors | null => {
      const cpf = (control.value || '').replace(/\D/g, '');
      if (cpf.length !== 11) return { cpfInvalido: true };
      if (/^(\d)\1{10}$/.test(cpf)) return { cpfInvalido: true };

      let soma1 = 0;
      for (let i = 0; i < 9; i++) soma1 += parseInt(cpf.charAt(i)) * (10 - i);
      let resto1 = soma1 % 11;
      let d1 = resto1 < 2 ? 0 : 11 - resto1;

      let soma2 = 0;
      for (let i = 0; i < 9; i++) soma2 += parseInt(cpf.charAt(i)) * (11 - i);
      soma2 += d1 * 2;
      let resto2 = soma2 % 11;
      let d2 = resto2 < 2 ? 0 : 11 - resto2;

      if (parseInt(cpf.charAt(9)) !== d1 || parseInt(cpf.charAt(10)) !== d2) {
        return { cpfInvalido: true };
      }
      return null;
    };
  }

  validarFormulario(): boolean {
    const cpfNumerico = (this.cadastroForm.get('cpf')?.value || '').replace(
      /\D/g,
      ''
    );
    const cepNumerico = (this.cadastroForm.get('cep')?.value || '').replace(
      /\D/g,
      ''
    );

    return (
      cpfNumerico.length === 11 &&
      this.cadastroForm.get('nome')?.value.trim() !== '' &&
      this.validarEmail(this.cadastroForm.get('email')?.value) &&
      this.cadastroForm.get('salario')?.value.toString().replace(/\D/g, '') >
        0 &&
      cepNumerico.length === 8 &&
      this.cadastroForm.get('logradouro')?.value.trim() !== '' &&
      this.cadastroForm.get('numero')?.value.toString().replace(/\D/g, '') >
        0 &&
      this.cadastroForm.get('cidade')?.value.trim() !== '' &&
      this.cadastroForm.get('estado')?.value.trim() !== ''
    );
  }

  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  mostrarMensagem(mensagem: string, tipo: 'sucesso' | 'erro'): void {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
      this.tipoMensagem = '';
    }, 5000);
  }

  limparFormulario(): void {
    this.cliente = {
      cpf: '',
      nome: '',
      email: '',
      telefone: '',
      salario: 0,
      endereco: {
        tipo: '',
        logradouro: '',
        numero: 0,
        complemento: '',
        CEP: '',
        cidade: '',
        estado: '',
      },
    };
    this.cadastroForm.reset();
  }

  formatarTelefone(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length <= 2) {
      value = value.replace(/^(\d{0,2})/, '($1');
    } else if (value.length <= 6) {
      value = value.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    } else if (value.length <= 10) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    this.cadastroForm.get('telefone')?.setValue(value, { emitEvent: false });
  }

  async buscarEnderecoPorCEP() {
    const cep = this.cadastroForm.get('cep')?.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      this.mostrarMensagem('CEP inválido. Deve conter 8 dígitos.', 'erro');
      return;
    }

    this.carregando = true;
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((response) => {
        if (!response.ok) throw new Error('Erro na resposta da API');
        return response.json();
      })
      .then((data) => {
        this.carregando = false;
        if (data.erro) {
          this.mostrarMensagem('CEP não encontrado.', 'erro');
          return;
        }
        const logradouroCompleto = data.logradouro;
        const partesLogradouro = logradouroCompleto.split(' ');
        const tipo = partesLogradouro[0];
        const tiposValidos = [
          'Rua',
          'Avenida',
          'Alameda',
          'Travessa',
          'Praça',
          'Rodovia',
          'Estrada',
          'Viela',
          'Largo',
        ];
        const tipoValido = tiposValidos.includes(tipo) ? tipo : 'Logradouro';
        const nomeLogradouro = partesLogradouro.slice(1).join(' ');

        this.cadastroForm.get('tipo')?.setValue(tipoValido);
        this.cadastroForm.get('logradouro')?.setValue(nomeLogradouro);
        this.cadastroForm.get('cidade')?.setValue(data.localidade);
        this.cadastroForm.get('estado')?.setValue(data.uf);

        setTimeout(() => {
          const numeroInput = document.getElementById(
            'numero'
          ) as HTMLInputElement;
          if (numeroInput) numeroInput.focus();
        }, 100);
      })
      .catch((error) => {
        this.carregando = false;
        console.error('Erro ao buscar CEP:', error);
        this.mostrarMensagem(
          'Erro ao buscar endereço. Verifique o CEP e tente novamente.',
          'erro'
        );
      });
  }
}
