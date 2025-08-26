import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../models/cliente.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tela-autocadastro',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './tela-autocadastro.component.html',
  styleUrl: './tela-autocadastro.component.css',
})
export class TelaAutocadastroComponent {

  cliente = {
    cpf: '',
    nome: '',
    email: '',
    salario: 0,
    endereco: {
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

  formatarCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    this.cliente.cpf = value;
  }

  formatarCEP(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }

    this.cliente.endereco.CEP = value;

    if (value.length === 9) {
      this.buscarEnderecoPorCEP();
    }
  }

  onSubmit() {
    if (!this.validarFormulario()) {
      this.mostrarMensagem(
        'Por favor, preencha todos os campos obrigatórios.',
        'erro'
      );
      return;
    }

    const cpfNumerico = this.cliente.cpf.replace(/\D/g, '');

    if (this.CPFJaCadastrado(cpfNumerico)) {
      this.mostrarMensagem(
        'CPF já cadastrado. Não é possível fazer um novo cadastro.',
        'erro'
      );
      return;
    }

    this.carregando = true;

    setTimeout(() => {
      const clienteCompleto: Cliente = {
        cpf: cpfNumerico,
        nome: this.cliente.nome,
        email: this.cliente.email,
        salario: this.cliente.salario,
        endereco: {
          logradouro: this.cliente.endereco.logradouro,
          numero: this.cliente.endereco.numero,
          complemento: this.cliente.endereco.complemento,
          CEP: this.cliente.endereco.CEP.replace(/\D/g, ''),
          cidade: this.cliente.endereco.cidade,
          estado: this.cliente.endereco.estado,
        },
        status: 'pendente',
        dataSolicitacao: new Date(),
        role: 'CLIENTE',
        senha: '',
      };

      this.salvarCliente(clienteCompleto);
      this.carregando = false;

      this.mostrarMensagem(
        'Solicitação de cadastro enviada com sucesso! Aguarde a aprovação do gerente.',
        'sucesso'
      );

      this.limparFormulario();
    }, 1500);
  }

  validarFormulario(): boolean {
    const cpfNumerico = this.cliente.cpf.replace(/\D/g, '');
    const cepNumerico = this.cliente.endereco.CEP.replace(/\D/g, '');

    return (
      cpfNumerico.length === 11 &&
      this.cliente.nome.trim() !== '' &&
      this.validarEmail(this.cliente.email) &&
      this.cliente.salario > 0 &&
      cepNumerico.length === 8 &&
      this.cliente.endereco.logradouro.trim() !== '' &&
      this.cliente.endereco.numero > 0 &&
      this.cliente.endereco.cidade.trim() !== '' &&
      this.cliente.endereco.estado.trim() !== ''
    );
  }

  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  CPFJaCadastrado(cpf: string): boolean {
    const clientes = this.obterClientes();
    return clientes.some((cliente) => cliente.cpf === cpf);
  }

  salvarCliente(cliente: Cliente): void {
    const clientes = this.obterClientes();
    clientes.push(cliente);
    localStorage.setItem('clientes_bantads', JSON.stringify(clientes));
  }

  obterClientes(): Cliente[] {
    const clientesJSON = localStorage.getItem('clientes_bantads');
    return clientesJSON ? JSON.parse(clientesJSON) : [];
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
      salario: 0,
      endereco: {
        logradouro: '',
        numero: 0,
        complemento: '',
        CEP: '',
        cidade: '',
        estado: '',
      },
    };
  }

  buscarEnderecoPorCEP() {
    const cep = this.cliente.endereco.CEP.replace(/\D/g, '');

    if (cep.length !== 8) {
      this.mostrarMensagem('CEP inválido. Deve conter 8 dígitos.', 'erro');
      return;
    }

    this.carregando = true;

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro na resposta da API');
        }
        return response.json();
      })
      .then((data) => {
        this.carregando = false;

        if (data.erro) {
          this.mostrarMensagem('CEP não encontrado.', 'erro');
          return;
        }

        this.cliente.endereco.logradouro = data.logradouro;
        this.cliente.endereco.cidade = data.localidade;
        this.cliente.endereco.estado = data.uf;
        this.cliente.endereco.complemento = data.complemento;

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
