import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { FooterComponent } from '../../../components/footer/footer.component';
import { Conta, Gerente } from '../../../models';
import { MockService } from '../../../services/mock.service';
import { RefreshService } from '../../../services/refresh.service';

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
  public gerentes: Gerente[] = [];

  constructor(
    private mockService: MockService,
    private router: Router,
    private refreshService: RefreshService
  ) {}

  ngOnInit(): void {
    this.carregarGerentes();
  }

  carregarGerentes() {
    const todosGerentes = this.mockService.getGerentes();
    this.gerentes = todosGerentes.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  excluirGerente(gerente: Gerente) {
    const contas: Conta[] = JSON.parse(
      localStorage.getItem('contaCliente') || '[]'
    );
    const gerentes = this.mockService.getGerentes();

    if (gerentes.length <= 1) {
      alert('Não é possível remover o último gerente do banco.');
      return;
    }

    const contasDoGerente = contas.filter(
      (c) => c.nomeGerente === gerente.nome
    );

    const outrosGerentes = gerentes.filter((g) => g.cpf !== gerente.cpf);
    const gerenteDestino = outrosGerentes.reduce((prev, curr) =>
      (prev.clientes?.length ?? 0) <= (curr.clientes?.length ?? 0) ? prev : curr
    );

    const confirmacao = confirm(
      `Tem certeza que deseja excluir o gerente ${gerente.nome}?\n\n` +
        `Ele possui ${contasDoGerente.length} clientes.\n` +
        `Esses clientes serão transferidos para o gerente ${gerenteDestino.nome}.`
    );

    if (!confirmacao) return;

    const contasAtualizadas = contas.map((c) =>
      c.nomeGerente === gerente.nome
        ? { ...c, nomeGerente: gerenteDestino.nome }
        : c
    );

    localStorage.setItem('contaCliente', JSON.stringify(contasAtualizadas));

    const index = gerentes.findIndex((g) => g.cpf === gerente.cpf);
    if (index !== -1) gerentes.splice(index, 1);

    alert(
      `Gerente ${gerente.nome} foi removido. Contas transferidas para ${gerenteDestino.nome}.`
    );

    this.carregarGerentes();
    this.refreshService.triggerRefresh();
  }

  editarGerente(cpf: string) {
    this.router.navigate(['/editar-gerente', cpf]);
  }
}
