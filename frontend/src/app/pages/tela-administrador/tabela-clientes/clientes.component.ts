import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conta } from '../../../models/conta.interface';
import { Gerente } from '../../../models/gerente.interface';
import { Cliente } from '../../../models/cliente.interface';

interface ClienteView {
  nome: string;
  cpf: string;
  email: string;
  salario: number;
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
  imports: [CommonModule],
})
export class ClientesComponent {
  clientes: ClienteView[] = [];

  constructor() {
    this.carregarClientes();
  }

  carregarClientes() {
    const clientesJSON = localStorage.getItem('clientes_bantads');
    const clientes: Cliente[] = clientesJSON ? JSON.parse(clientesJSON) : [];

    const contasJSON = localStorage.getItem('contaCliente');
    const contas: Conta[] = contasJSON ? JSON.parse(contasJSON) : [];

    const gerentesJSON = localStorage.getItem('gerentes_bantads');
    const gerentes: Gerente[] = gerentesJSON ? JSON.parse(gerentesJSON) : [];

    const listaClientes: ClienteView[] = contas.map((conta) => {
      const gerente = gerentes.find((g) => g.nome === conta.nomeGerente);

      return {
        nome: conta.cliente.nome,
        cpf: conta.cliente.cpf,
        email: conta.cliente.email,
        salario: conta.cliente.salario,
        conta: conta.numeroConta,
        saldo: conta.saldo,
        limite: conta.limite,
        nomeGerente: conta.nomeGerente,
        cpfGerente: gerente ? gerente.cpf : '',
      };
    });

    this.clientes = listaClientes.sort((a, b) => a.nome.localeCompare(b.nome));
  }
}
