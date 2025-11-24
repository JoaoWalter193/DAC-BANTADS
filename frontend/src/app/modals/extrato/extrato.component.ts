import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {
  ContaExtrato,
  MovimentacaoPorDia,
} from '../../models/conta/conta-extrato.interface';
import { Transacao } from '../../models/conta/transacao.interface';
import { adaptarExtratoApi } from '../../adapter/extrato.adapter';

@Component({
  selector: 'app-extrato',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './extrato.component.html',
  styleUrl: './extrato.component.css',
})
export class ExtratoComponent {
  extrato: ContaExtrato;
  nomeClienteLogado: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    data: {
      extrato: any;
      nomeCliente: string;
    }
  ) {
    this.extrato = adaptarExtratoApi(data.extrato);
    this.nomeClienteLogado = data.nomeCliente;
  }

  get movimentacoesFiltradas(): MovimentacaoPorDia[] {
    if (!this.extrato || !this.extrato.movimentacoes) return [];
    const inicio = this.extrato.periodo.inicio.getTime();

    const dataFimBoundary = new Date(this.extrato.periodo.fim);
    dataFimBoundary.setDate(dataFimBoundary.getDate() + 1);
    const fimBoundary = dataFimBoundary.getTime();

    return this.extrato.movimentacoes.filter((dia) => {
      const dataDia = dia.data.getTime();
      return dataDia >= inicio && dataDia < fimBoundary;
    });
  }

  saida(transacao: Transacao): boolean {
    if (transacao.tipo.toUpperCase() === 'SAQUE') return true;

    if (
      transacao.tipo.toUpperCase() === 'TRANSFERENCIA' &&
      transacao.origem === this.nomeClienteLogado
    )
      return true;
    return false;
  }
}
