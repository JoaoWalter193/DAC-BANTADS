import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { MockService } from '../../services/mock.service';
import { Gerente } from '../../models/gerente/gerente.interface';
import { Conta } from '../../models/conta/conta.interface';

@Component({
  selector: 'app-cadastro-gerente',
  templateUrl: './cadastro-gerente.html',
  styleUrls: ['./cadastro-gerente.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NavbarComponent,
    MatButtonModule,
    FooterComponent,
  ],
})
export class CadastroGerente {
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

  constructor(
    private router: Router,
    private mockService: MockService,
    private location: Location
  ) {}

  private atribuirContaAoNovoGerente(novoGerente: Gerente) {
    const contas: Conta[] = JSON.parse(
      localStorage.getItem('contaCliente') || '[]'
    );
    if (!contas || contas.length === 0) return;

    const contagemPorGerente: Record<string, Conta[]> = {};
    contas.forEach((conta) => {
      if (!contagemPorGerente[conta.nomeGerente]) {
        contagemPorGerente[conta.nomeGerente] = [];
      }
      contagemPorGerente[conta.nomeGerente].push(conta);
    });

    const maxContas = Math.max(
      ...Object.values(contagemPorGerente).map((c) => c.length)
    );

    const gerentesComMaisContas = Object.entries(contagemPorGerente)
      .filter(([_, c]) => c.length === maxContas)
      .map(([nomeGerente, c]) => ({ nomeGerente, contas: c }));

    if (
      gerentesComMaisContas.length === 1 &&
      gerentesComMaisContas[0].contas.length === 1
    )
      return;

    let contaParaTransferir: Conta | null = null;

    if (gerentesComMaisContas.length === 1) {
      contaParaTransferir = gerentesComMaisContas[0].contas[0];
    } else {
      const todasContasEmpatadas: Conta[] = [];
      gerentesComMaisContas.forEach((g) =>
        todasContasEmpatadas.push(...g.contas)
      );

      contaParaTransferir =
        todasContasEmpatadas
          .filter((c) => c.saldo >= 0)
          .sort((a, b) => a.saldo - b.saldo)[0] || todasContasEmpatadas[0];
    }

    if (contaParaTransferir) {
      contaParaTransferir.nomeGerente = novoGerente.nome;
      localStorage.setItem('contaCliente', JSON.stringify(contas));
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
    return this.mockService.getGerentes().some((g) => g.cpf === cpf);
  }

  salvarGerente(gerente: Gerente): void {
    this.mockService.getGerentes().push(gerente);
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
      const novoGerente: Gerente = {
        cpf: cpfNumerico,
        nome: this.gerente.nome,
        email: this.gerente.email,
        senha: this.gerente.senha,
        role: 'GERENTE',
        clientes: [],
      };

      this.atribuirContaAoNovoGerente(novoGerente);
      this.salvarGerente(novoGerente);

      this.carregando = false;
      this.mostrarMensagem(
        'Cadastro de gerente realizado com sucesso!',
        'sucesso'
      );
      this.limparFormulario();
      this.router.navigate(['/tela-administrador']);
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

  limparFormulario(): void {
    this.gerente = {
      cpf: '',
      nome: '',
      email: '',
      senha: '',
      role: 'GERENTE',
      clientes: [],
    };
  }

  voltar(): void {
    this.location.back();
  }
}
