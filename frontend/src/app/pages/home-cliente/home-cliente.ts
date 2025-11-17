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
import { Conta } from '../../models/conta/conta.interface';
import { NavbarComponent } from '../../components/navbar/navbar.component';

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
  conta: Conta | null = null;
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
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.formExtrato = this.formBuilder.group({
      dataInicio: [null, Validators.required],
      dataFim: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.conta = this.contaService.obterSaldo(this.conta?.numeroConta || '');
  }

  expandirOperacao(
    operacao: 'saque' | 'deposito' | 'transferencia' | 'extrato' | '' = ''
  ): void {
    this.limparMensagem();
    if (this.operacaoAtiva === operacao) {
      this.operacaoAtiva = '';
    } else {
      this.operacaoAtiva = operacao;
    }
  }

  realizarSaque(): void {
    if (!this.valorSaque || this.valorSaque <= 0) {
      this.mostrarMensagem('Insira um valor positivo.', 'erro');
      return;
    }

    try {
      this.contaService.sacar(this.conta?.numeroConta || '', this.valorSaque);
      this.valorSaque = null;
    } catch (error: any) {
      this.mostrarMensagem(error.message, 'erro');
    }
  }

  realizarDeposito(): void {
    if (!this.valorDeposito || this.valorDeposito <= 0) {
      this.mostrarMensagem('Insira um valor positivo.', 'erro');
      return;
    }

    try {
      this.contaService.depositar(
        this.conta?.numeroConta || '',
        this.valorDeposito
      );
      this.valorDeposito = null;
    } catch (error: any) {
      this.mostrarMensagem(error.message, 'erro');
    }
  }

  realizarTransferencia(): void {
    if (!this.valorTransferencia || !this.contaDestino) {
      this.mostrarMensagem(
        'Por favor, insira o valor e o numero da conta destino.',
        'erro'
      );
      return;
    }

    try {
      this.contaService.transferir(
        this.conta?.numeroConta || '',
        this.contaDestino,
        this.valorTransferencia
      );
      this.valorTransferencia = null;
      this.contaDestino = null;
    } catch (error: any) {
      this.mostrarMensagem(error.message, 'erro');
    }
  }

  gerarExtrato(): void {
    this.contaService.obterExtrato(this.conta?.numeroConta || '');
  }

  private mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
  }

  private limparMensagem() {
    this.mensagem = null;
    this.tipoMensagem = null;
  }
}
