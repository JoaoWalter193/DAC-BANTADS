import { Routes } from '@angular/router';
import { TelaAdministradorComponent } from './pages/tela-administrador/tela-administrador.component';
import { GerentesComponent } from './pages/gerentes/gerentes.component';

export const routes: Routes = [
    {
        path : 'tela-administrador',
        component: TelaAdministradorComponent
    }, {
        path : 'gerentes',
        component : GerentesComponent
    }
];
