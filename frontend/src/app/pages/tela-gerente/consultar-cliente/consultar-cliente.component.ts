import { Component } from '@angular/core';
import { Cliente } from '../../../models';
import { ClienteService } from '../../../services/cliente.service';
import { CommonModule } from '@angular/common';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ClienteDashboardDTO extends Cliente {
  conta: string;
  saldo: number;
  limite: number;
  cpfGerente: string;
  nomeGerente: string;
}

@Component({
  selector: 'app-consultar-cliente',
  imports: [CommonModule, FormatarCpfPipe, FormsModule, RouterLink],
  templateUrl: './consultar-cliente.component.html',
  styleUrl: './consultar-cliente.component.css',
})
export class ConsultarClienteComponent {
  clientes: ClienteDashboardDTO[] = [];
  filtro: string = '';

  constructor(private clientesService: ClienteService) {
    this.clientesService.clientes$.subscribe((lista) => {
      this.clientes = lista;
    });
    this.clientesService.carregarClientes();
  }

  get clientesFiltrados(): ClienteDashboardDTO[] {
    const termo = this.filtro.toLowerCase();
    return this.clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpf.includes(termo)
    );
  }

  calcularLimite(salario: number): number {
    if (salario < 2000) {
      return 0;
    } else {
      return salario / 2;
    }
  }
}
