import { Routes } from '@angular/router';
import { TelaAdministradorComponent } from './pages/tela-administrador/tela-administrador.component';
import { GerentesComponent } from './pages/tela-administrador/gerentes/gerentes.component';

export const routes: Routes = [
  {
    path: 'tela-administrador',
    component: TelaAdministradorComponent,
    children: [
      {
        path: 'gerentes',
        component: GerentesComponent
      }
    ]
  }
];
