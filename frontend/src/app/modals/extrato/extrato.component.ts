import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ContaExtrato } from '../../models/conta/conta-extrato.interface';
import { Transacao } from '../../models/conta/transacao.interface';

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
      extrato: ContaExtrato;
      nomeCliente: string;
    }
  ) {
    this.extrato = data.extrato;
    this.nomeClienteLogado = data.nomeCliente;
  }

  saida(transacao: Transacao): boolean {
    if (transacao.tipo === 'SAQUE') return true;
    if (
      transacao.tipo === 'TRANSFERENCIA' &&
      transacao.origem === this.nomeClienteLogado
    )
      return true;
    return false;
  }
}
