// tabela-todos-clientes.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { ClienteService } from '../../../services/cliente.service';
import { ClienteRelatorioDTO } from '../../../models/cliente/dto/cliente-relatorio-dto';

@Component({
  selector: 'app-tabela-todos-clientes',
  templateUrl: './tabela-todos-clientes.component.html',
  styleUrls: ['./tabela-todos-clientes.component.css'],
  standalone: true,
  imports: [CommonModule, FormatarCpfPipe],
})
export class TabelaTodosClientesComponent {
  clientes: ClienteRelatorioDTO[] = [];

  constructor(private clienteService: ClienteService) {
    this.carregarClientes();
  }

  carregarClientes() {
    this.clienteService
      .listarClientes('adm_relatorio_clientes')
      .subscribe((data) => {
        // LOG 1: Verifica o payload recebido da API (DEVE AGORA SER COMPLETO)
        console.log('Dados brutos recebidos da API:', data);

        // Se a ordenação não foi feita no backend, fazemos aqui
        this.clientes = data as ClienteRelatorioDTO[];

        // ORDENAÇÃO: Ordena a lista de forma crescente por nome do cliente (R16)
        this.clientes.sort((a, b) => {
          if (a.nome < b.nome) {
            return -1;
          }
          if (a.nome > b.nome) {
            return 1;
          }
          return 0;
        });

        // LOG 2: Verifica a lista após a ordenação
        console.log('Lista de clientes após ordenação:', this.clientes);
      });
  }
}
