import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GerentesComponent } from './gerentes/gerentes.component';

@Component({
  selector: 'app-tela-administrador',
  templateUrl: './tela-administrador.component.html',
  standalone: true,
  imports: [CommonModule, GerentesComponent] 
})
export class TelaAdministradorComponent {}
