import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Gerente } from '../../models/gerente.interface';
import { MockService } from '../../services/mock.service';

@Component({
  selector: 'app-editar-gerente',
  templateUrl: './editar-gerente.html',
  styleUrls: ['./editar-gerente.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
})
export class EditarGerente implements OnInit {
  gerente: Gerente = {
    cpf: '',
    nome: '',
    email: '',
    senha: '',
    role: 'GERENTE',
    clientes: [],
  };

  mensagem: string = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';
  carregando: boolean = false;
  private cpfOriginal: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mockService: MockService
  ) {}

  ngOnInit(): void {
    const cpfParam = this.route.snapshot.paramMap.get('cpf');
    if (cpfParam) {
      const gerentes = this.mockService.getGerentes();
      const gerenteEncontrado = gerentes.find((g) => g.cpf === cpfParam);
      if (gerenteEncontrado) {
        this.gerente = { ...gerenteEncontrado };
        this.cpfOriginal = gerenteEncontrado.cpf;
      }
    }
  }

  formatarCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9)
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    else if (value.length > 6)
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (value.length > 3)
      value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
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

  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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

  CPFJaCadastrado(cpf: string): boolean {
    return this.mockService
      .getGerentes()
      .some((g) => g.cpf === cpf && g.cpf !== this.cpfOriginal);
  }

  atualizarGerente(gerenteAtualizado: Gerente): void {
    const gerentes = this.mockService.getGerentes();
    const index = gerentes.findIndex((g) => g.cpf === this.cpfOriginal);
    if (index !== -1) {
      const gerenteAnterior = gerentes[index];
      gerentes[index] = gerenteAtualizado;
      this.cpfOriginal = gerenteAtualizado.cpf;

      // atualizar o novo nome do gerente nos clientes
      if (gerenteAnterior.clientes?.length) {
        gerenteAnterior.clientes.forEach((cliente) => {
          const conta = this.mockService.findContaCpf(cliente.cpf);
          if (conta) {
            conta.nomeGerente = gerenteAtualizado.nome;
            this.mockService.updateConta(conta);
          }
        });
      }
      localStorage.setItem('gerentes_bantads', JSON.stringify(gerentes));
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

    const cpfNumerico = this.gerente.cpf.replace(/\D/g, '');
    if (cpfNumerico !== this.cpfOriginal && this.CPFJaCadastrado(cpfNumerico)) {
      this.mostrarMensagem('CPF já cadastrado por outro gerente.', 'erro');
      return;
    }

    this.carregando = true;

    setTimeout(() => {
      const gerenteAtualizado: Gerente = {
        cpf: cpfNumerico,
        nome: this.gerente.nome,
        email: this.gerente.email,
        senha: this.gerente.senha,
        role: 'GERENTE',
        clientes: this.gerente.clientes || [],
      };

      this.atualizarGerente(gerenteAtualizado);
      this.carregando = false;
      this.mostrarMensagem('Gerente atualizado com sucesso!', 'sucesso');
      this.router.navigate(['/tela-administrador/gerentes']);
    }, 1000);
  }

  mostrarMensagem(mensagem: string, tipo: 'sucesso' | 'erro'): void {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
      this.tipoMensagem = '';
    }, 5000);
  }
}
