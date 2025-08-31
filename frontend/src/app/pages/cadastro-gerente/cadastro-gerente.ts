import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Gerente } from '../../models/gerente.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cadastro-gerente',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './cadastro-gerente.html',
  styleUrl: './cadastro-gerente.css',
})
export class CadastroGerente {
  gerente: Gerente = {
    cpf: '',
    nome: '',
    email: '',
    senha: '',
    role: 'GERENTE',
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

    this.gerente.cpf = value;
  }

  validarCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number(cpf.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== Number(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== Number(cpf.charAt(10))) return false;

    return true;
  }

  onSubmit() {
    if (!this.validarFormulario()) {
      this.mostrarMensagem(
        'Por favor, preencha todos os campos obrigatórios.',
        'erro'
      );
      return;
    }

    const cpfNumerico = this.gerente.cpf.replace(/\D/g, '');

    if (this.CPFJaCadastrado(cpfNumerico)) {
      this.mostrarMensagem(
        'CPF já cadastrado. Não é possível fazer um novo cadastro.',
        'erro'
      );
      return;
    }

    this.carregando = true;

    setTimeout(() => {
      const gerenteCompleto: Gerente = {
        cpf: cpfNumerico,
        nome: this.gerente.nome,
        email: this.gerente.email,
        senha: this.gerente.senha,
        role: 'GERENTE',
      };

      this.salvarGerente(gerenteCompleto);
      this.carregando = false;

      this.mostrarMensagem(
        'Cadastro de gerente realizado com sucesso!',
        'sucesso'
      );

      this.limparFormulario();
    }, 1500);
  }

  validarFormulario(): boolean {
    const cpfNumerico = this.gerente.cpf.replace(/\D/g, '');

    return (
      cpfNumerico.length === 11 &&
      this.gerente.nome.trim() !== '' &&
      this.validarEmail(this.gerente.email) &&
      this.gerente.senha.trim() !== ''
    );
  }

  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  CPFJaCadastrado(cpf: string): boolean {
    const gerentes = this.obterGerentes();
    return gerentes.some((gerente) => gerente.cpf === cpf);
  }

  salvarGerente(gerente: Gerente): void {
    const gerentes = this.obterGerentes();
    gerentes.push(gerente);
    localStorage.setItem('gerentes_bantads', JSON.stringify(gerentes));
  }

  obterGerentes(): Gerente[] {
    const gerentesJSON = localStorage.getItem('gerentes_bantads');
    return gerentesJSON ? JSON.parse(gerentesJSON) : [];
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
    this.gerente = {
      cpf: '',
      nome: '',
      email: '',
      senha: '',
      role: 'GERENTE',
    };
  }
}
