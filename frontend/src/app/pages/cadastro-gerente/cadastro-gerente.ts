import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { GerenteService } from '../../services/gerente.service';
import { CriarGerenteDTO } from '../../models/gerente/dto/gerente-criar.dto';

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
  gerente: CriarGerenteDTO = {
    cpf: '',
    nome: '',
    email: '',
    senha: '',
    tipo: 'GERENTE',
  };

  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';
  carregando = false;

  constructor(
    private router: Router,
    private gerenteService: GerenteService,
    private location: Location
  ) {}

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
    for (let i = 0; i < 9; i++) soma += +cpf[i] * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto >= 10) resto = 0;
    if (resto !== +cpf[9]) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += +cpf[i] * (11 - i);
    resto = (soma * 10) % 11;
    if (resto >= 10) resto = 0;

    return resto === +cpf[10];
  }

  validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validarFormulario(): boolean {
    const cpfNumerico = this.gerente.cpf.replace(/\D/g, '');
    return (
      cpfNumerico.length === 11 &&
      this.validarCPF(this.gerente.cpf) &&
      this.gerente.nome.trim() !== '' &&
      this.validarEmail(this.gerente.email) &&
      this.gerente.senha.trim() !== ''
    );
  }

  onSubmit() {
    if (!this.validarFormulario()) {
      this.mostrarMensagem(
        'Por favor, preencha todos os campos corretamente.',
        'erro'
      );
      return;
    }

    this.carregando = true;

    const dto: CriarGerenteDTO = {
      cpf: this.gerente.cpf.replace(/\D/g, ''),
      nome: this.gerente.nome,
      email: this.gerente.email,
      senha: this.gerente.senha,
      tipo: 'GERENTE',
    };

    this.gerenteService.criarGerente(dto).subscribe({
      next: (resp) => {
        this.carregando = false;
        this.mostrarMensagem('Gerente cadastrado com sucesso!', 'sucesso');
        this.limparFormulario();

        this.router.navigate(['/tela-administrador']);
      },
      error: (err) => {
        this.carregando = false;

        const msg =
          err.status === 403
            ? 'Você não tem permissão para cadastrar um gerente.'
            : err.status === 401
            ? 'Sessão expirada. Faça login novamente.'
            : 'Erro ao cadastrar gerente.';

        this.mostrarMensagem(msg, 'erro');
      },
    });
  }

  mostrarMensagem(msg: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = msg;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
      this.tipoMensagem = '';
    }, 3000);
  }

  limparFormulario() {
    this.gerente = {
      cpf: '',
      nome: '',
      email: '',
      senha: '',
      tipo: 'GERENTE',
    };
  }

  voltar() {
    this.location.back();
  }
}
