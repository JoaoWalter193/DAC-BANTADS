import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TelaAdministradorComponent } from './pages/tela-administrador/tela-administrador.component';
import { GerentesComponent } from './pages/tela-administrador/tabela-gerentes/gerentes.component';
import { HomeCliente } from './pages/home-cliente/home-cliente';
import { TelaAutocadastroComponent } from './pages/tela-autocadastro/tela-autocadastro.component';
import { ClientesComponent } from './pages/tela-administrador/tabela-clientes/clientes.component';
import { CadastroGerente } from './pages/cadastro-gerente/cadastro-gerente';
import { PerfilClienteComponent } from './pages/perfil-cliente/perfil-cliente.component';
import { EditarGerente } from './pages/editar-gerente/editar-gerente';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'cadastro',
    component: TelaAutocadastroComponent,
  },

  {
    path: 'tela-administrador',
    component: TelaAdministradorComponent,
    children: [
      {
        path: 'gerentes',
        component: GerentesComponent,
      },
      {
        path: 'clientes',
        component: ClientesComponent,
      },
    ],
  },
  {
    path: 'cadastro-gerente',
    component: CadastroGerente,
  },

  {
    path: 'home-cliente',
    component: HomeCliente,
  },
  {
    path: 'perfil',
    component: PerfilClienteComponent
  },
    {
    path: 'editar-gerente',
    component: EditarGerente,
  },
];
