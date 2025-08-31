import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GerentesComponent } from './tabela-gerentes/gerentes.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ClientesComponent } from './tabela-clientes/clientes.component';
import { Router, RouterLink } from '@angular/router';

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
  ],
})
export class TelaAdministradorComponent {}
