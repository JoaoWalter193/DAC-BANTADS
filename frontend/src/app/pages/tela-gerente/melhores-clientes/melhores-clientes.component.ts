import { Component } from '@angular/core';
import { Cliente, Conta, Gerente } from '../../../models';
import { CommonModule } from '@angular/common';
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
  selector: 'app-melhores-clientes',
  imports: [CommonModule, FormatarCpfPipe, FormsModule],
  templateUrl: './melhores-clientes.component.html',
  styleUrl: './melhores-clientes.component.css'
})

export class MelhoresClientesComponent {
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
        } as ClienteDashboardDTO;
      })
      .sort((a, b) => a.salario - b.salario)
      .slice(0, 3);
  }
}

