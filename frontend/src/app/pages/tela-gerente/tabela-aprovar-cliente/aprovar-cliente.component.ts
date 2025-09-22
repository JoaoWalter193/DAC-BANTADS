import { CommonModule, registerLocaleData } from '@angular/common';
import { Component } from '@angular/core';
import { Cliente, Gerente } from '../../../models';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/extra/pt';
import { ClientesComponent } from '../tabela-clientes/clientes.component';
import { ClienteService } from '../../../services/cliente.service';

registerLocaleData(localePt, 'pt-BR', localePtExtra);

@Component({
  selector: 'app-aprovar-cliente',
  imports: [CommonModule, FormatarCpfPipe],
  templateUrl: './aprovar-cliente.component.html',
  styleUrl: './aprovar-cliente.component.css',
  providers: [{ provide: 'LOCALE_ID', useValue: 'pt-BR' }],
})
export class AprovarClienteComponent {
  clientes: Cliente[] = [];
  limite: number = 0;

  constructor(private clientesService: ClienteService) {}

  ngOnInit() {
    this.clientes = this.getContasPendentes();
  }

  getContasPendentes(): Cliente[] {
    const currentUserJSON = localStorage.getItem('currentUser');

    if (!currentUserJSON) {
      this.clientes = [];
      return [];
    }

    const gerente = JSON.parse(currentUserJSON).user;
    if (!gerente || !gerente.clientes) {
      this.clientes = [];
      return [];
    }

    this.clientes = (gerente.clientes || []).filter(
      (cliente: { status: string }) => cliente.status === 'pendente'
    );
    return this.clientes;
  }

  calcularLimite(salario: number): number {
    if (salario < 2000) {
      return 0;
    } else {
      return salario / 2;
    }
  }

  aprovar(cpf: string) {
    const cliente = this.clientes.find(
      (c) => (c.cpf || '').replace(/\D/g, '') === cpf.replace(/\D/g, '')
    );
    if (!cliente) return;

    cliente.status = 'aprovado';
    this.clientesService.updateCliente(cliente);
    this.clientes = this.getContasPendentes();
  }

  rejeitar(cpf: string) {
    const cliente = this.clientes.find(
      (c) => (c.cpf || '').replace(/\D/g, '') === cpf.replace(/\D/g, '')
    );
    if (!cliente) return;

    cliente.status = 'rejeitado';
    this.clientesService.updateCliente(cliente);
    this.clientes = this.getContasPendentes();
  }
}
