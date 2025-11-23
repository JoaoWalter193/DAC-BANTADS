import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { ClienteService } from '../../../services/cliente.service';
import { ClienteDetalhesDTO } from '../../../models/cliente/dto/cliente-detalhes.dto';
import { ClienteListaGerenteDTO } from '../../../models/cliente/dto/cliente-lista-gerente.dto'; // ✅ Nova importação

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
  sugestoes: ClienteListaGerenteDTO[] = [];
  carregando: boolean = false;

  constructor(private clienteService: ClienteService) {}

  consultarCliente() {
    this.erro = '';
    this.clienteEncontrado = null;
    this.sugestoes = [];

    if (!this.cpf || this.cpf.length !== 11) {
      this.erro = 'CPF deve ter 11 dígitos';
      return;
    }

    this.carregando = true;

    this.clienteService.consultarCliente(this.cpf).subscribe({
      next: (cliente) => {
        this.clienteEncontrado = cliente;
        this.carregando = false;
        console.log('Cliente encontrado:', cliente);
      },
      error: (err) => {
        this.erro = 'Cliente não encontrado';
        this.clienteEncontrado = null;
        this.carregando = false;
        console.error('Erro ao consultar cliente:', err);
      },
    });
  }

  buscarSugestoes() {
    this.sugestoes = [];
    this.clienteEncontrado = null;
    this.erro = '';

    if (this.cpf.length >= 3) {
      this.clienteService.listarClientes().subscribe({
        next: (todosClientes) => {
          this.sugestoes = todosClientes
            .filter((c: ClienteListaGerenteDTO) => c.cpf.startsWith(this.cpf))
            .slice(0, 5);
        },
        error: (err) => {
          console.error('Erro ao buscar sugestões:', err);
        },
      });
    }
  }

  selecionarSugestao(cliente: ClienteListaGerenteDTO) {
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

  limparBusca() {
    this.cpf = '';
    this.clienteEncontrado = null;
    this.erro = '';
    this.sugestoes = [];
  }
}
