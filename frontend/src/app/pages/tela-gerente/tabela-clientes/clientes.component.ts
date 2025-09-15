import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conta } from '../../../models/conta.interface';
import { Gerente } from '../../../models/gerente.interface';
import { Cliente } from '../../../models/cliente.interface';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { FormsModule } from '@angular/forms';

interface ClienteDashboardDTO extends Cliente {
  conta: string;
  saldo: number;
  limite: number;
  cpfGerente: string;
  nomeGerente: string;
}

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  standalone: true,
  styleUrl: './clientes.component.css',
  imports: [CommonModule, FormatarCpfPipe, FormsModule],
})
export class ClientesComponent {
  clientes: ClienteDashboardDTO[] = [];
  filtro: string = '';

  constructor() {
    this.carregarClientes();
  }

  carregarClientes() {
    const currentUserJSON = localStorage.getItem('currentUser');
    const contasJSON = localStorage.getItem('contaCliente');

    if (!currentUserJSON || !contasJSON) {
      this.clientes = [];
      return;
    }

    const gerente: Gerente = JSON.parse(currentUserJSON).user;
    const contas: Conta[] = JSON.parse(contasJSON);

    this.clientes = (gerente.clientes || [])
      .map((cliente) => {
        const conta = contas.find((c) => c.cliente.cpf === cliente.cpf);

        return {
          ...cliente,
          conta: conta ? conta.numeroConta : '',
          saldo: conta ? conta.saldo : 0,
          limite: conta ? conta.limite : 0,
          cpfGerente: gerente.cpf,
          nomeGerente: gerente.nome,
        } as ClienteDashboardDTO;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  get clientesFiltrados(): ClienteDashboardDTO[] {
    const termo = this.filtro.toLowerCase();
    return this.clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpf.includes(termo)
    );
  }
}
