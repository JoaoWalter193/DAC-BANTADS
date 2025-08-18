import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TelaAdministradorComponent } from './pages/tela-administrador/tela-administrador.component';
import { GerentesComponent } from './pages/tela-administrador/gerentes/gerentes.component';

export const routes: Routes = [
  {
    path: "",
    component: LoginComponent,
  },
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
]
