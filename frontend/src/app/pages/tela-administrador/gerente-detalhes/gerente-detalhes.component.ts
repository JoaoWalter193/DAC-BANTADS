import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { MockService } from '../../../services/mock.service';
import { Gerente } from '../../../models';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { FooterComponent } from '../../../components/footer/footer.component';

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
  constructor(private mockService: MockService) {}

  ngOnInit(): void {
    const todosGerentes = this.mockService.getGerentes();
    this.gerentes = todosGerentes.sort((a, b) => a.nome.localeCompare(b.nome));
  }
}
