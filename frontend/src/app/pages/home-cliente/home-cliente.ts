import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
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
  cliente!: ClienteDetalhesDTO;
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
    private authService: AuthService, // Injetar AuthService
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.formExtrato = this.formBuilder.group({
      dataInicio: [null, Validators.required],
      dataFim: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    const usuarioLogado = this.authService.getUsuarioLogado();
    if (usuarioLogado && usuarioLogado.cpf) {
      this.carregarDadosCliente(usuarioLogado.cpf);
    }
  }

  carregarDadosCliente(cpf: string) {
    this.clienteService.consultarCliente(cpf).subscribe({
      next: (data) => {
        this.cliente = data;
      },
      error: (err) => console.error('Erro ao carregar cliente', err),
    });
  }

  expandirOperacao(
    operacao: 'saque' | 'deposito' | 'transferencia' | 'extrato' | '' = ''
  ): void {
    this.limparMensagem();
    this.operacaoAtiva = this.operacaoAtiva === operacao ? '' : operacao;
  }

  realizarSaque(): void {
    if (!this.valorSaque || this.valorSaque <= 0) {
      this.mostrarMensagem('Insira um valor positivo.', 'erro');
      return;
    }

    this.contaService.sacar(this.cliente.conta, this.valorSaque).subscribe({
      next: (res) => {
        this.mostrarMensagem('Saque realizado com sucesso!', 'sucesso');
        this.valorSaque = null;
        this.carregarDadosCliente(this.cliente.cpf);
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
    if (!this.valorDeposito || this.valorDeposito <= 0) {
      this.mostrarMensagem('Insira um valor positivo.', 'erro');
      return;
    }

    this.contaService
      .depositar(this.cliente.conta, this.valorDeposito)
      .subscribe({
        next: (res) => {
          this.mostrarMensagem('Depósito realizado com sucesso!', 'sucesso');
          this.valorDeposito = null;
          this.carregarDadosCliente(this.cliente.cpf);
        },
        error: (err) => {
          this.mostrarMensagem('Erro ao depositar.', 'erro');
        },
      });
  }

  realizarTransferencia(): void {
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
        next: (res) => {
          this.mostrarMensagem('Transferência realizada!', 'sucesso');
          this.valorTransferencia = null;
          this.contaDestino = null;
          this.carregarDadosCliente(this.cliente.cpf);
        },
        error: (err) => {
          this.mostrarMensagem(
            'Erro na transferência. Verifique o saldo ou a conta destino.',
            'erro'
          );
        },
      });
  }

  gerarExtrato(): void {
    this.contaService.obterExtrato(this.cliente.conta).subscribe({
      next: (dadosExtrato) => {
        this.dialog.open(ExtratoComponent, {
          data: {
            extrato: dadosExtrato,
            nomeCliente: this.cliente.nome,
          },
          width: '600px',
        });
      },
      error: (err) => this.mostrarMensagem('Erro ao carregar extrato', 'erro'),
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
