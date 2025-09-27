import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ExtratoTotal, Transacao, TipoTransacao } from '../../models';

@Component({
  selector: 'app-extrato',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './extrato.component.html',
  styleUrl: './extrato.component.css'
})

export class ExtratoComponent {
  extrato: ExtratoTotal;
  nomeClienteLogado: string;

  constructor(@Inject(MAT_DIALOG_DATA) data: { extrato: ExtratoTotal, nomeCliente: string }) {
    this.extrato = data.extrato;
    this.nomeClienteLogado = data.nomeCliente;
  }

  saida(transacao: Transacao): boolean {
    if (transacao.tipo === TipoTransacao.SAQUE) return true;
    if (transacao.tipo === TipoTransacao.TRANSFERENCIA && transacao.clienteOrigem === this.nomeClienteLogado) return true;
    return false;
  }
}
