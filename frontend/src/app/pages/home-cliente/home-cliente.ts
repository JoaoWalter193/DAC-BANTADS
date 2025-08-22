import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ContaService } from '../../services/conta.service';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";

@Component({
  selector: 'app-home-cliente',
  imports: [MatIconModule, MatTableModule, CommonModule, RouterLink, NavbarComponent],
  templateUrl: './home-cliente.html',
  styleUrl: './home-cliente.css',
})
export class HomeCliente implements OnInit {
  cliente: any;
  operacaoAtiva: 'saque' | 'deposito' | 'transferencia' | '' = '';

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
    this.cliente = this.contaService.getConta();
  }
}
