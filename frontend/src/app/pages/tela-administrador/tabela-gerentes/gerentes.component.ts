import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockService } from '../../../services/mock.service';
import { Gerente } from '../../../models/gerente.interface';
import { Conta } from '../../../models/conta.interface';
import { Router } from '@angular/router';
import { RefreshService } from '../../../services/refresh.service';

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
    private mockService: MockService,
    private router: Router,
    private refreshService: RefreshService
  ) {
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

  excluirGerente(gerente: GerenteView) {
    const contas: Conta[] = JSON.parse(
      localStorage.getItem('contaCliente') || '[]'
    );
    const gerentes = this.mockService.getGerentes();

    if (gerentes.length <= 1) {
      alert('Não é possível remover o último gerente do banco.');
      return;
    }

    const contasDoGerente = contas.filter(
      (c) => c.nomeGerente === gerente.nome
    );

    // Encontrar o gerente com menos clientes
    const outrosGerentes = gerentes.filter((g) => g.cpf !== gerente.cpf);
    const gerenteDestino = outrosGerentes.reduce((prev, curr) =>
      (prev.clientes?.length ?? 0) <= (curr.clientes?.length ?? 0) ? prev : curr
    );

    const confirmacao = confirm(
      `Tem certeza que deseja excluir o gerente ${gerente.nome}?\n\n` +
        `Ele possui ${contasDoGerente.length} clientes.\n` +
        `Esses clientes serão transferidos para o gerente ${gerenteDestino.nome}.`
    );

    if (!confirmacao) {
      return; // usuário cancelou
    }

    // Transferir as contas
    const contasAtualizadas = contas.map((c) =>
      c.nomeGerente === gerente.nome
        ? { ...c, nomeGerente: gerenteDestino.nome }
        : c
    );

    // Atualiza contas no localStorage
    localStorage.setItem('contaCliente', JSON.stringify(contasAtualizadas));

    // Remove o gerente do mockService (em memória)
    this.mockService.getGerentes().splice(
      this.mockService.getGerentes().findIndex((g) => g.cpf === gerente.cpf),
      1
    );

    alert(
      `Gerente ${gerente.nome} foi removido. Contas transferidas para ${gerenteDestino.nome}.`
    );

    this.carregarGerentes();
    this.refreshService.triggerRefresh();
  }

  editarGerente(cpf: string) {
    this.router.navigate(['/editar-gerente', cpf]);
  }
}
