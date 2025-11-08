import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientesComponent } from './tabela-clientes/clientes.component';
import { AprovarClienteComponent } from './tabela-aprovar-cliente/aprovar-cliente.component';

@Component({
  selector: 'app-tela-gerente',
  imports: [
    CommonModule,
    ClientesComponent,
    RouterLink,
    AprovarClienteComponent,
  ],
  templateUrl: './tela-gerente.component.html',
  styleUrl: './tela-gerente.component.css',
})
export class TelaGerenteComponent {}
