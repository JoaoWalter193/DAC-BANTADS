import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cliente } from '../../../models/cliente/cliente.interface';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { ClienteService } from '../../../services/cliente.service';
import { ClienteDashboardDTO } from '../../../models/cliente/dto/cliente-dashboard.dto';
import { ClienteDetalhesDTO } from '../../../models/cliente/dto/cliente-detalhes.dto';

@Component({
  selector: 'app-consultar-cliente',
  imports: [CommonModule, FormatarCpfPipe, FormsModule, RouterLink],
  templateUrl: './consultar-cliente.component.html',
  styleUrl: './consultar-cliente.component.css',
})
export class ConsultarClienteComponent {
  cpf: string = '';
  clienteEncontrado: ClienteDetalhesDTO | null = null;
  erro: string = '';
  sugestoes: Cliente[] = [];

  constructor(private clienteService: ClienteService) {}

  consultarCliente() {
    this.erro = '';
    this.clienteEncontrado = null;

    const cliente = this.clienteService.consultarCliente(this.cpf);
  }

  buscarSugestoes() {
    this.sugestoes = [];
    this.clienteEncontrado = null;
    this.erro = '';

    if (this.cpf.length >= 1) {
      this.clienteService.listarClientes().subscribe((todosClientes) => {
        this.sugestoes = todosClientes.filter((c: { cpf: string; }) => {
          c.cpf.startsWith(this.cpf)
        })
      });
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
