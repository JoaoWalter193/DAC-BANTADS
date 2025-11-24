import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ContaService } from '../../services/conta.service';
import { ExtratoComponent } from '../../modals/extrato/extrato.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ClienteService } from '../../services/cliente.service';
import { ClienteDetalhesDTO } from '../../models/cliente/dto/cliente-detalhes.dto';
import { AuthService } from '../../services/auth.service'; // Importar Auth para pegar o ID correto

@Component({
  selector: 'app-home-cliente',
  standalone: true,
  imports: [
    MatIconModule,
    MatTableModule,
    CommonModule,
    RouterLink,
    NavbarComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './home-cliente.html',
  styleUrl: './home-cliente.css',
})
export class HomeCliente implements OnInit {
  cliente: any = {
    nome: 'Carregando...',
    saldo: 0,
    conta: null,
    cpf: null,
  };

  contaEncontrada: boolean = false;
  operacaoAtiva: 'saque' | 'deposito' | 'transferencia' | 'extrato' | '' = '';

  valorSaque: number | null = null;
  valorDeposito: number | null = null;
  valorTransferencia: number | null = null;
  contaDestino: string | null = null;

  formExtrato: FormGroup;
  mensagem: string | null = null;
  tipoMensagem: 'sucesso' | 'erro' | null = null;

  constructor(
    private contaService: ContaService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.formExtrato = this.formBuilder.group({
      dataInicio: [null, Validators.required],
      dataFim: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.inicializarDados();
  }

  inicializarDados() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      this.router.navigate(['/login']);
      return;
    }

    const sessao = JSON.parse(currentUserStr);

    if (!sessao.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    if (sessao.usuario.nome) this.cliente.nome = sessao.usuario.nome;
    else if (sessao.usuario.email) this.cliente.nome = sessao.usuario.email;

    if (sessao.usuario.cpf) {
      console.log('CPF recuperado da sessão:', sessao.usuario.cpf);
      this.cliente.cpf = sessao.usuario.cpf;
      this.buscarContaDoCliente(this.cliente.cpf);
    } else {
      console.warn('Usuário logado sem CPF na sessão:', sessao.usuario);
      this.mostrarMensagem(
        'Erro: Dados de login incompletos (CPF ausente).',
        'erro'
      );
    }
  }

  buscarContaDoCliente(cpf: string) {
    this.contaService.buscarContaPorCpf(cpf).subscribe({
      next: (dadosConta: any) => {
        console.log('Conta encontrada:', dadosConta);
        this.cliente.conta =
          dadosConta.id ||
          dadosConta.numero ||
          dadosConta.numeroConta ||
          dadosConta.numConta;
        this.cliente.saldo = dadosConta.saldo;
        this.contaEncontrada = true;

        if (dadosConta.cliente && dadosConta.cliente.nome) {
          this.cliente.nome = dadosConta.cliente.nome;
        }
      },
      error: (err: any) => {
        console.error('Erro ao buscar conta:', err);
        if (err.status === 404) {
          this.mostrarMensagem(
            'Sua conta está em aprovação ou não existe.',
            'erro'
          );
          this.cliente.saldo = 0;
          this.contaEncontrada = false;
        } else {
          this.mostrarMensagem('Erro de conexão ao buscar conta.', 'erro');
        }
      },
    });
  }

  atualizarSaldo() {
    if (!this.cliente.conta) return;
    this.contaService.obterSaldo(this.cliente.conta).subscribe({
      next: (res: any) => (this.cliente.saldo = res.saldo),
      error: (err: any) => console.error('Erro ao atualizar saldo', err),
    });
  }

  validarOperacao(): boolean {
    if (!this.contaEncontrada || !this.cliente.conta) {
      this.mostrarMensagem('Conta indisponível.', 'erro');
      return false;
    }
    return true;
  }

  expandirOperacao(
    operacao: 'saque' | 'deposito' | 'transferencia' | 'extrato' | '' = ''
  ): void {
    this.limparMensagem();
    if (operacao !== '' && !this.validarOperacao()) return;

    if (this.operacaoAtiva === operacao) {
      this.operacaoAtiva = '';
    } else {
      this.operacaoAtiva = operacao;
    }
  }

  realizarSaque(): void {
    if (!this.validarOperacao()) return;
    if (!this.valorSaque || this.valorSaque <= 0) {
      this.mostrarMensagem('Insira um valor positivo.', 'erro');
      return;
    }

    this.contaService.sacar(this.cliente.conta, this.valorSaque).subscribe({
      next: (res) => {
        this.mostrarMensagem('Saque realizado com sucesso!', 'sucesso');
        this.valorSaque = null;
        this.atualizarSaldo();
      },
      error: (err) => {
        this.mostrarMensagem(
          'Erro ao sacar: ' +
            (err.error?.message || 'Saldo insuficiente ou erro interno'),
          'erro'
        );
      },
    });
  }

  realizarDeposito(): void {
    if (!this.validarOperacao()) return;
    if (!this.valorDeposito || this.valorDeposito <= 0) {
      this.mostrarMensagem('Insira um valor positivo.', 'erro');
      return;
    }

    this.contaService
      .depositar(this.cliente.conta, this.valorDeposito)
      .subscribe({
        next: (res: any) => {
          this.mostrarMensagem('Depósito realizado com sucesso!', 'sucesso');
          this.valorDeposito = null;
          this.atualizarSaldo();
        },
        error: (err: any) => {
          this.mostrarMensagem('Erro ao realizar depósito.', 'erro');
        },
      });
  }

  realizarTransferencia(): void {
    if (!this.validarOperacao()) return;
    if (!this.valorTransferencia || !this.contaDestino) {
      this.mostrarMensagem('Preencha valor e conta de destino.', 'erro');
      return;
    }

    this.contaService
      .transferir(
        this.cliente.conta,
        this.contaDestino,
        this.valorTransferencia
      )
      .subscribe({
        next: (res: any) => {
          this.mostrarMensagem('Transferência realizada!', 'sucesso');
          this.valorTransferencia = null;
          this.contaDestino = null;
          this.atualizarSaldo();
        },
        error: (err: any) => {
          this.mostrarMensagem('Erro na transferência.', 'erro');
        },
      });
  }

  gerarExtrato(): void {
    if (this.formExtrato.invalid) {
      this.mostrarMensagem('Selecione as datas.', 'erro');
      return;
    }

    const { dataInicio, dataFim } = this.formExtrato.value;

    this.contaService
      .obterExtrato(this.cliente.conta, dataInicio, dataFim)
      .subscribe({
        next: (dadosApi: any) => {
          const dadosCompletos = {
            ...dadosApi,
            periodo: {
              inicio: dataInicio,
              fim: dataFim,
            },
          };

          this.dialog.open(ExtratoComponent, {
            width: '800px',
            data: {
              extrato: dadosCompletos,
              nomeCliente: this.cliente.nome,
            },
          });
        },
        error: (err: any) =>
          this.mostrarMensagem('Erro ao obter extrato.', 'erro'),
      });
  }

  private mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
    setTimeout(() => this.limparMensagem(), 5000);
  }

  private limparMensagem() {
    this.mensagem = null;
    this.tipoMensagem = null;
  }
}
