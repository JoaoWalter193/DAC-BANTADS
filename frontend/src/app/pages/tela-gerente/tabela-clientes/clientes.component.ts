import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { RouterModule } from '@angular/router';
import { ClienteDashboardDTO } from '../../../models/cliente/dto/cliente-dashboard.dto';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  standalone: true,
  styleUrl: './clientes.component.css',
  imports: [CommonModule, RouterModule, FormatarCpfPipe, FormsModule],
})
export class ClientesComponent {
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
