import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conta, Gerente } from '../../../models';
import { MockService } from '../../../services/mock.service';

interface GerenteView extends Gerente {
  qtdClientes: number;
  saldoPositivo: number;
  saldoNegativo: number;
}

@Component({
  selector: 'app-gerentes',
  templateUrl: './gerentes.component.html',
  standalone: true,
  styleUrls: ['./gerentes.component.css'],
  imports: [CommonModule],
})
export class GerentesComponent {
  gerentes: GerenteView[] = [];

  constructor(
    private mockService: MockService  ) {
    this.carregarGerentes();
  }

  carregarGerentes() {
    const gerentes = this.mockService.getGerentes();
    const contas: Conta[] = JSON.parse(
      localStorage.getItem('contaCliente') || '[]'
    );

    this.gerentes = gerentes.map((g) => {
      const contasGerente = contas.filter((c) => c.nomeGerente === g.nome);
      const saldoPositivo = contasGerente
        .map((c) => c.saldo)
        .filter((s) => s >= 0)
        .reduce((acc, val) => acc + val, 0);
      const saldoNegativo = contasGerente
        .map((c) => c.saldo)
        .filter((s) => s < 0)
        .reduce((acc, val) => acc + val, 0);

      return {
        ...g,
        qtdClientes: contasGerente.length,
        saldoPositivo,
        saldoNegativo,
      };
    });

    this.gerentes.sort((a, b) => b.saldoPositivo - a.saldoPositivo);
  }
}
