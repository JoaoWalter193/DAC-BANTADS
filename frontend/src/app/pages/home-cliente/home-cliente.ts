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
  cliente: any;
  conta: any;
  operacaoAtiva: 'saque' | 'deposito' | 'transferencia' | '' = '';
  valor: number | null = null;

  expandirOperacao(
    operacao: 'saque' | 'deposito' | 'transferencia' | '' = ''
  ): void {
    if (this.operacaoAtiva === operacao) {
      this.operacaoAtiva = '';
    } else {
      this.operacaoAtiva = operacao;
    }
  }

  constructor(private contaService: ContaService) {}

  ngOnInit(): void {
    this.conta = this.contaService.getConta();
  }

  realizarSaque(): void {
    if (!this.valor) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    try {
      this.contaService.sacar(this.valor);
      this.conta.saldo -= this.valor;
      this.valor = null;

      alert('Saque realizado com sucesso!');
    } catch (error: any) {
      alert(error.message);
    }
  }

  realizarDeposito(): void {
    if (!this.valor) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    try {
      this.contaService.depositar(this.valor);
      this.conta.saldo += this.valor;
      this.valor = null;

      alert('Deposito realizado com sucesso!');
    } catch (error: any) {
      alert(error.message);
    }
  }

}
