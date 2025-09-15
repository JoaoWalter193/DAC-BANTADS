import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ClientesComponent } from './tabela-clientes/clientes.component';
import { RouterLink } from '@angular/router';
import { AprovarClienteComponent } from './tabela-aprovar-cliente/aprovar-cliente.component';

@Component({
  selector: 'app-tela-gerente',
  imports: [CommonModule,
    NavbarComponent,
    ClientesComponent,
    RouterLink,
    AprovarClienteComponent],
  templateUrl: './tela-gerente.component.html',
  styleUrl: './tela-gerente.component.css'
})
export class TelaGerenteComponent {

}
