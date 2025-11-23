import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { FormsModule } from '@angular/forms';
import { GerenteService } from '../../../services/gerente.service';
import { RouterModule } from '@angular/router';
import { ClienteListaGerenteDTO } from '../../../models/cliente/dto/cliente-lista-gerente.dto';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  standalone: true,
  styleUrl: './clientes.component.css',
  imports: [CommonModule, RouterModule, FormatarCpfPipe, FormsModule],
})
export class ClientesComponent implements OnInit {
  clientes: ClienteListaGerenteDTO[] = [];
  filtro: string = '';

  constructor(private gerenteService: GerenteService) {}

  ngOnInit(): void {
    this.carregarClientesDoGerente();
  }

  carregarClientesDoGerente(): void {
    const cpfGerenteLogado = this.obterCpfGerenteLogado();

    this.gerenteService.getClientesDoGerente(cpfGerenteLogado).subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        console.log('Clientes carregados:', this.clientes);
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
      },
    });
  }

  onFiltroChange(): void {
    const cpfGerenteLogado = this.obterCpfGerenteLogado();

    this.gerenteService
      .getClientesDoGerente(cpfGerenteLogado, this.filtro)
      .subscribe({
        next: (clientes) => {
          this.clientes = clientes;
        },
        error: (err) => {
          console.error('Erro ao filtrar clientes:', err);
        },
      });
  }

  get clientesFiltrados(): ClienteListaGerenteDTO[] {
    const termo = this.filtro.toLowerCase();
    return this.clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpf.includes(termo)
    );
  }

  private obterCpfGerenteLogado(): string {
    return '98574307084';
  }
}
