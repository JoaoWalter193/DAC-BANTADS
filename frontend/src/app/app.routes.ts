import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TelaAdministradorComponent } from './pages/tela-administrador/tela-administrador.component';
import { GerentesComponent } from './pages/tela-administrador/tabela-gerentes/gerentes.component';
import { HomeCliente } from './pages/home-cliente/home-cliente';
import { TelaAutocadastroComponent } from './pages/tela-autocadastro/tela-autocadastro.component';
import { ClientesComponent } from './pages/tela-gerente/tabela-clientes/clientes.component';
import { CadastroGerente } from './pages/cadastro-gerente/cadastro-gerente';
import { PerfilClienteComponent } from './pages/perfil-cliente/perfil-cliente.component';
import { EditarGerente } from './pages/editar-gerente/editar-gerente';
import { TelaGerenteComponent } from './pages/tela-gerente/tela-gerente.component';
import { Component } from '@angular/core';
import { ConsultarClienteComponent } from './pages/tela-gerente/consultar-cliente/consultar-cliente.component';
import { MelhoresClientesComponent } from './pages/tela-gerente/melhores-clientes/melhores-clientes.component';
import { TelaGerenteDashboardComponent } from './pages/tela-gerente-dashboard/tela-gerente-dashboard.component';
import { TabelaTodosClientesComponent } from './pages/tela-administrador/tabela-todos-clientes/tabela-todos-clientes.component';
import { ClienteDetalhesComponent } from './pages/tela-gerente/cliente-detalhes/cliente-detalhes.component';
import { GerenteDetalhesComponent } from './pages/tela-administrador/gerente-detalhes/gerente-detalhes.component';
import { adminGuard, clienteGuard, gerenteGuard } from './guard';
import { DashboardComponent } from './pages/tela-administrador/dashboard/dashboard.component';
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
    canActivate: [adminGuard],
    children: [
      {
        path: 'gerentes',
        component: GerentesComponent,
      },
      {
        path: 'clientes',
        component: TabelaTodosClientesComponent,
      },
    ],
  },

  {
    path: 'tela-gerente',
    component: TelaGerenteDashboardComponent,
    canActivate: [gerenteGuard],
    children: [
      {
        path: '',
        component: TelaGerenteComponent,
      },

      {
        path: 'melhores-clientes',
        component: MelhoresClientesComponent,
      },

      {
        path: 'consultar-cliente',
        component: ConsultarClienteComponent,
      },
    ],
  },

  {
    path: 'cadastro-gerente',
    component: CadastroGerente,
    canActivate: [adminGuard],
  },

  {
    path: 'gerente-detalhes',
    component: GerenteDetalhesComponent,
    canActivate: [adminGuard],
  },

  {
    path: 'home-cliente',
    component: HomeCliente,
    canActivate: [clienteGuard],
  },
  {
    path: 'perfil',
    component: PerfilClienteComponent,
    canActivate: [clienteGuard],
  },
  {
    path: 'editar-gerente/:cpf',
    component: EditarGerente,
    canActivate: [adminGuard],
  },
  {
    path: 'clientes/:cpf',
    component: ClienteDetalhesComponent,
    canActivate: [gerenteGuard],
  },
  {
    path: 'dashboard-gerente',
    component: DashboardComponent,
    canActivate: [adminGuard],
  },
];
