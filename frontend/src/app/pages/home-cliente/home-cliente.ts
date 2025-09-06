import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ContaService } from '../../services/conta.service';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { Conta } from '../../models';

@Component({
  selector: 'app-home-cliente',
  imports: [MatIconModule, MatTableModule, CommonModule, RouterLink, NavbarComponent, FormsModule],
  templateUrl: './home-cliente.html',
  styleUrl: './home-cliente.css',
})
export class HomeCliente implements OnInit {
  conta: Conta | null = null;
  operacaoAtiva: 'saque' | 'deposito' | 'transferencia' | '' = '';
  valorSaque: number | null = null;
  valorDeposito: number | null = null;
  valorTransferencia: number | null = null;
  contaDestino: string | null = null;

  mensagem: string | null = null;
  tipoMensagem: 'sucesso' | 'erro' | null = null;

  constructor(private contaService: ContaService) {}

  ngOnInit(): void {
    this.conta = this.contaService.getConta();
  }

  expandirOperacao(
    operacao: 'saque' | 'deposito' | 'transferencia' | '' = ''
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
      this.mostrarMensagem('Por favor, insira um valor válido.', 'erro');
      return;
    }

    try {
      const contaAtualizada = this.contaService.sacar(this.valorSaque);
      this.conta = contaAtualizada;
      this.valorSaque = null;

      this.mostrarMensagem('Saque realizado com sucesso!', 'sucesso');
    } catch (error: any) {
      this.mostrarMensagem(error.message, 'erro');
    }
  }

  realizarDeposito(): void {
    if (!this.valorDeposito || this.valorDeposito <= 0) {
      this.mostrarMensagem('Por favor, insira um valor válido.', 'erro');
      return;
    }

    try {
      this.contaService.depositar(this.valorDeposito);
      this.conta = this.contaService.getConta();
      this.valorDeposito = null;

      this.mostrarMensagem('Depósito realizado com sucesso!', 'sucesso');
    } catch (error: any) {
      this.mostrarMensagem(error.message, 'erro');
    }
  }

  realizarTransferencia(): void {
    if (!this.valorTransferencia || !this.contaDestino) {
      this.mostrarMensagem('Por favor, insira o valor e o numero da conta destino.', 'erro');
      return;
    }

    try {
      const contaAtualizada = this.contaService.transferir(this.valorTransferencia, this.contaDestino);
      this.conta = contaAtualizada;
      this.mostrarMensagem('Transferência realizada com sucesso!', 'sucesso');
      this.valorTransferencia = null;
      this.contaDestino = null;
    } catch (error: any) {
      this.mostrarMensagem(error.message, 'erro');
    }
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
