import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GerenteService } from '../../../services/gerente.service';
import { GerenteDashboardDTO } from '../../../models/gerente/dto/gerente-dashboard.dto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  chartDataClientes: any[] = [];
  chartDataSaldoPositivo: any[] = [];
  chartDataSaldoNegativo: any[] = [];

  view: [number, number] = [700, 400];

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabelClientes = 'Gerentes';
  xAxisLabelSaldos = 'Gerentes';
  showYAxisLabel = true;
  yAxisLabelClientes = 'Qtd. Clientes';
  yAxisLabelSaldos = 'Valor (R$)';
  colorScheme = 'vivid';

  constructor(private gerenteService: GerenteService) {}

  ngOnInit(): void {
    this.carregarDadosDashboard();
  }

  carregarDadosDashboard(): void {
    this.gerenteService.getGerentes('dashboard').subscribe({
      next: (data) => {
        const dashboardData = data as GerenteDashboardDTO[];

        this.chartDataClientes = dashboardData.map((g) => ({
          name: g.gerente.nome,
          value: g.clientes.length,
        }));

        this.chartDataSaldoPositivo = dashboardData.map((g) => ({
          name: g.gerente.nome,
          value: g.saldo_positivo,
        }));

        this.chartDataSaldoNegativo = dashboardData.map((g) => ({
          name: g.gerente.nome,
          value: Math.abs(g.saldo_negativo),
        }));
      },
      error: (err) => {
        console.error('Erro ao carregar dados do dashboard:', err);
      },
    });
  }

  formatCurrency(val: number): string {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatInteger(val: number): string {
    return val.toString();
  }
}
