import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GerenteService } from '../../../services/gerente.service';
import { GerenteDashboardDTO } from '../../../models/gerente/dto/gerente-dashboard.dto';

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

  constructor(private gerenteService: GerenteService) {
    this.carregarGerentes();
  }

  carregarGerentes() {
    this.gerenteService.getGerentes().subscribe((data) => {
      this.gerentes = data as GerenteDashboardDTO[];

      this.qtdClientes = this.gerentes.reduce(
        (sum, g) => sum + (g.clientes ? g.clientes.length : 0),
        0
      );

      this.gerentes.sort((a, b) => b.saldo_positivo - a.saldo_positivo);
    });
  }
}
