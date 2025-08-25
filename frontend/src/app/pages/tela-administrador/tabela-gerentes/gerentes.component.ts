import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Cliente {
  nome: string;
  saldo: number;
}

interface Gerente {
  nome: string;
  clientes: Cliente[];
}

@Component({
  selector: 'app-gerentes',
  templateUrl: './gerentes.component.html',
  standalone: true,
  styleUrl: './gerentes.component.css',
  imports: [CommonModule],
})
export class GerentesComponent {
  gerentes: Gerente[] = [
    {
      nome: 'João Silva',
      clientes: [
        { nome: 'Cliente A', saldo: 1000 },
        { nome: 'Cliente B', saldo: -200 },
        { nome: 'Cliente C', saldo: 0 },
      ],
    },
    {
      nome: 'Maria Souza',
      clientes: [
        { nome: 'Cliente D', saldo: 5000 },
        { nome: 'Cliente E', saldo: -500 },
      ],
    },
    {
      nome: 'Carlos Pereira',
      clientes: [
        { nome: 'Cliente F', saldo: 300 },
        { nome: 'Cliente G', saldo: -100 },
        { nome: 'Cliente H', saldo: 150 },
      ],
    },
  ].sort((a, b) => this.totalSaldoPositivo(b) - this.totalSaldoPositivo(a));

  totalSaldoPositivo(gerente: Gerente): number {
    return gerente.clientes
      .map((c) => c.saldo)
      .filter((s) => s >= 0)
      .reduce((acc, val) => acc + val, 0);
  }

  totalSaldoNegativo(gerente: Gerente): number {
    return gerente.clientes
      .map((c) => c.saldo)
      .filter((s) => s < 0)
      .reduce((acc, val) => acc + val, 0);
  }

  adicionarGerente() {
    console.log('Adicionar novo gerente clicado');
  }

  verDetalhes(gerente: Gerente) {
    console.log('Ver detalhes do gerente clicad', gerente);
  }
}
