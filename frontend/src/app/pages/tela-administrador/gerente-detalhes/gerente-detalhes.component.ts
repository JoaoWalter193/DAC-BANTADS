import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { FooterComponent } from '../../../components/footer/footer.component';
import { Gerente } from '../../../models/gerente/gerente.interface';
import { Conta } from '../../../models/conta/conta.interface';
import { GerenteService } from '../../../services/gerente.service';
import { GerenteDashboardDTO } from '../../../models/gerente/dto/gerente-dashboard.dto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-gerente-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FormatarCpfPipe,
    FooterComponent,
  ],
  templateUrl: './gerente-detalhes.component.html',
  styleUrls: ['./gerente-detalhes.component.css'],
})
export class GerenteDetalhesComponent implements OnInit {
  gerentes: Gerente[] = [];

  constructor(private gerenteService: GerenteService, private router: Router) {}

  ngOnInit(): void {
    this.carregarTodosGerentes();
  }

  carregarTodosGerentes() {
    // CORREÇÃO 1: Usar o novo método listGerentesBasic() para listar todos
    this.gerenteService.listGerentesBasic().subscribe({
      // CORREÇÃO 2: Tipagem explícita para 'data'
      next: (data: Gerente[]) => {
        this.gerentes = data;
        console.log('Lista básica de Gerentes carregada.', data);
      },
      // CORREÇÃO 3: Tipagem explícita para 'err'
      error: (err: HttpErrorResponse) => {
        console.error('ERRO ao carregar lista básica de Gerentes:', err);
      },
    });
  }

  excluirGerente(cpf: string) {
    const gerenteInfo = this.gerentes.find((g) => g.cpf === cpf);
    const nomeGerente = gerenteInfo ? gerenteInfo.nome : cpf;

    // Regra 1: Não permitir a exclusão do último gerente
    if (this.gerentes.length <= 1) {
      // SUBSTITUIÇÃO: alert()
      console.warn(
        `[NOTIFICACAO NECESSARIA] Não é possível remover o último gerente do banco.`
      );
      return;
    }

    // Regra 2: Substituir confirm() por um mecanismo de confirmação
    // Aqui assumimos que a confirmação é feita ANTES da chamada desta função

    // Simula a remoção (deve ser precedida por uma confirmação na UI)
    this.gerenteService.removerGerente(cpf).subscribe({
      next: () => {
        console.log(`[SUCESSO] Gerente ${nomeGerente} removido.`);
        // SUBSTITUIÇÃO: alert()
        console.log(`Gerente ${nomeGerente} foi removido.`);
        this.carregarTodosGerentes();
      },
      error: (err: HttpErrorResponse) => {
        console.error(`[ERRO] Falha ao remover gerente ${nomeGerente}:`, err);
      },
    });
  }

  editarGerente(cpf: string) {
    this.router.navigate(['/editar-gerente', cpf]);
  }
}
