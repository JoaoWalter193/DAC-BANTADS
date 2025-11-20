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
  public gerentes: GerenteDashboardDTO[] = [];

  constructor(private gerenteService: GerenteService, private router: Router) {}

  ngOnInit(): void {
    this.carregarGerentes();
  }

  carregarGerentes() {
    this.gerenteService.getGerentes().subscribe((data) => {
      this.gerentes = data;
    });
    this.gerentes.sort((a, b) => a.gerente.nome.localeCompare(b.gerente.nome));
  }

  excluirGerente(gerente: GerenteDashboardDTO) {
    if (this.gerentes.length <= 1) {
      alert('Não é possível remover o último gerente do banco.');
      return;
    }

    const confirmacao = confirm(
      `Tem certeza que deseja excluir o gerente ${gerente.gerente.nome}?\n\n` +
        `Ele possui ${gerente.clientes?.length} clientes.\n`
    );

    if (!confirmacao) return;

    this.gerenteService.removerGerente(gerente.gerente.cpf);

    alert(`Gerente ${gerente.gerente.nome} foi removido.`);
    this.carregarGerentes();
  }

  editarGerente(cpf: string) {
    this.router.navigate(['/editar-gerente', cpf]);
  }
}
