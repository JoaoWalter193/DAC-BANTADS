import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GerentesComponent } from './tabela-gerentes/gerentes.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ClientesComponent } from './tabela-clientes/clientes.component';
import { Router, RouterLink } from '@angular/router';
import { AprovarClienteComponent } from './tabela-aprovar-cliente/aprovar-cliente.component';

@Component({
  selector: 'app-tela-administrador',
  templateUrl: './tela-administrador.component.html',
  styleUrl: './tela-administrador.component.css',
  standalone: true,
  imports: [
    CommonModule,
    GerentesComponent,
    NavbarComponent,
    ClientesComponent,
    RouterLink,
    AprovarClienteComponent
  ],
})
export class TelaAdministradorComponent {}
