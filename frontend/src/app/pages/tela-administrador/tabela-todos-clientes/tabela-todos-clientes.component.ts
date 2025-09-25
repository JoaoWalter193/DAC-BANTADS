import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockService } from '../../../services/mock.service';
import { Conta } from '../../../models/conta.interface';
import { Gerente } from '../../../models/gerente.interface';
import { Cliente } from '../../../models/cliente.interface';
import { RefreshService } from '../../../services/refresh.service';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';

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
  selector: 'app-tabela-todos-clientes',
  templateUrl: './tabela-todos-clientes.component.html',
  styleUrls: ['./tabela-todos-clientes.component.css'],
  standalone: true,
  imports: [CommonModule, FormatarCpfPipe],
})
export class TabelaTodosClientesComponent {
  clientes: ClienteView[] = [];

  constructor(
    private mockService: MockService,
    private refreshService: RefreshService
  ) {
    this.carregarClientes();

    this.refreshService.refresh$.subscribe(() => {
      this.carregarClientes();
    });
  }

  carregarClientes() {
    const clientes: Cliente[] = this.mockService.getClientes();
    const gerentes: Gerente[] = this.mockService.getGerentes();
    const contas: Conta[] = JSON.parse(
      localStorage.getItem('contaCliente') || '[]'
    );

    this.clientes = contas.map((conta) => {
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
      } as ClienteView;
    });

    this.clientes.sort((a, b) => a.nome.localeCompare(b.nome));
  }
}
