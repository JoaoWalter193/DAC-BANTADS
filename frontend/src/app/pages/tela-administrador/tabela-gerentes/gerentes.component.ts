import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gerente } from '../../../models/gerente.interface';
import { Conta } from '../../../models/conta.interface';

interface GerenteView {
  cpf: string;
  nome: string;
  email: string;
  role: 'GERENTE';
  senha: string;
  qtdClientes: number;
  saldoPositivo: number;
  saldoNegativo: number;
}

@Component({
  selector: 'app-gerentes',
  templateUrl: './gerentes.component.html',
  standalone: true,
  styleUrl: './gerentes.component.css',
  imports: [CommonModule],
})
export class GerentesComponent {
  gerentes: GerenteView[] = [];

  constructor() {
    this.carregarGerentes();
  }

  carregarGerentes() {
    const gerentesJSON = localStorage.getItem('gerentes_bantads');
    const gerentes: Gerente[] = gerentesJSON ? JSON.parse(gerentesJSON) : [];

    const contasJSON = localStorage.getItem('contas_bantads');
    const contas: Conta[] = contasJSON ? JSON.parse(contasJSON) : [];

    const listaGerentes: GerenteView[] = gerentes.map((g) => {
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

    this.gerentes = listaGerentes.sort(
      (a, b) => b.saldoPositivo - a.saldoPositivo
    );
  }

  excluirGerente(gerente: GerenteView) {
    const gerentesJSON = localStorage.getItem('gerentes_bantads');
    let gerentes: Gerente[] = gerentesJSON ? JSON.parse(gerentesJSON) : [];

    if (gerentes.length <= 1) {
      alert('Não é possível remover o último gerente do banco.');
      return;
    }

    const contasJSON = localStorage.getItem('contas_bantads');
    let contas: Conta[] = contasJSON ? JSON.parse(contasJSON) : [];

    // Contas do gerente a ser removido
    const contasDoGerente = contas.filter(
      (c) => c.nomeGerente === gerente.nome
    );

    // Encontrar o gerente com menos contas
    const outrosGerentes = gerentes.filter((g) => g.cpf !== gerente.cpf);
    const gerentesComContas = outrosGerentes.map((g) => {
      const qtd = contas.filter((c) => c.nomeGerente === g.nome).length;
      return { ...g, qtd };
    });
    gerentesComContas.sort((a, b) => a.qtd - b.qtd);
    const gerenteDestino = gerentesComContas[0];

    // Transferir as contas
    contas = contas.map((c) =>
      c.nomeGerente === gerente.nome
        ? { ...c, nomeGerente: gerenteDestino.nome }
        : c
    );

    gerentes = gerentes.filter((g) => g.cpf !== gerente.cpf);
    localStorage.setItem('gerentes_bantads', JSON.stringify(gerentes));
    localStorage.setItem('contas_bantads', JSON.stringify(contas));

    alert(
      `Gerente ${gerente.nome} foi removido. Contas transferidas para ${gerenteDestino.nome}.`
    );

    this.carregarGerentes();
  }
}
