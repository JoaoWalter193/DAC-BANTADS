import { Component } from '@angular/core';
import { GerenteService } from '../../../services/gerente.service';
import { GerenteDashboardDTO } from '../../../models/gerente/dto/gerente-dashboard.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gerentes',
  templateUrl: './gerentes.component.html',
  standalone: true,
  styleUrls: ['./gerentes.component.css'],
  imports: [CommonModule],
})
export class GerentesComponent {
  gerentes: GerenteDashboardDTO[] = [];
  qtdClientes: number = 0;
  isLoading: boolean = false; // Adicionando estado de carregamento

  constructor(private gerenteService: GerenteService) {
    this.carregarGerentes();
  }

  carregarGerentes() {
    this.isLoading = true;

    // ** CORREÇÃO AQUI: Passando o filtro 'dashboard' **
    this.gerenteService.getGerentes('dashboard').subscribe({
      next: (data) => {
        this.gerentes = data as GerenteDashboardDTO[];

        // Cálculo da quantidade total de clientes
        this.qtdClientes = this.gerentes.reduce(
          (sum, g) => sum + (g.clientes ? g.clientes.length : 0),
          0
        );

        // Ordenação (mantida, mas o API Gateway também deve garantir)
        this.gerentes.sort((a, b) => b.saldo_positivo - a.saldo_positivo);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar gerentes para dashboard:', err);
        this.isLoading = false;
        // Aqui você pode adicionar lógica para mostrar um erro na UI
      }
    });
  }
}
