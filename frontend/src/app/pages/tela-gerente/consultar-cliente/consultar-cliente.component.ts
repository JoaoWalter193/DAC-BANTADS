import { Component } from '@angular/core';
import { Cliente, Conta } from '../../../models';
import { ClienteService } from '../../../services/cliente.service';
import { MockService } from '../../../services/mock.service';
import { CommonModule } from '@angular/common';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ClienteDashboardDTO extends Cliente {
  conta: string;
  saldo: number;
  limite: number;
  cpfGerente?: string;
  nomeGerente?: string;
}

@Component({
  selector: 'app-consultar-cliente',
  imports: [CommonModule, FormatarCpfPipe, FormsModule, RouterLink],
  templateUrl: './consultar-cliente.component.html',
  styleUrl: './consultar-cliente.component.css',
})
export class ConsultarClienteComponent {
  cpf: string = '';
  clienteEncontrado: ClienteDashboardDTO | null = null;
  erro: string = '';
  sugestoes: Cliente[] = [];

  constructor(
    private clienteService: ClienteService,
    private mockService: MockService
  ) {}

  consultarCliente() {
    this.erro = '';
    this.clienteEncontrado = null;

    const cliente = this.mockService.findClienteCpf(this.cpf);
    const conta = this.mockService.findContaCpf(this.cpf);

    if (cliente && conta) {
      this.clienteEncontrado = {
        ...cliente,
        conta: conta.numeroConta,
        saldo: conta.saldo,
        limite: conta.limite,
        nomeGerente: conta.nomeGerente,
      };
      this.sugestoes = []; // limpa sugestões
    } else {
      this.erro = 'Cliente não encontrado.';
    }
  }

  buscarSugestoes() {
    this.sugestoes = [];
    this.clienteEncontrado = null;
    this.erro = '';

    if (this.cpf.length >= 1) {
      const todosClientes = this.mockService.getClientes();
      this.sugestoes = todosClientes.filter((c) => c.cpf.startsWith(this.cpf));
    }
  }

  selecionarSugestao(cliente: Cliente) {
    this.cpf = cliente.cpf;
    this.sugestoes = [];
    this.consultarCliente();
  }

  calcularLimite(salario: number): number {
    if (salario < 2000) {
      return 0;
    } else {
      return salario / 2;
    }
  }
}
