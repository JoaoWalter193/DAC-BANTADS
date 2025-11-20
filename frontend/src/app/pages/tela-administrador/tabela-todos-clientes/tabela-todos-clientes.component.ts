import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { ClienteService } from '../../../services/cliente.service';
import { ClienteDetalhesDTO } from '../../../models/cliente/dto/cliente-detalhes.dto';

@Component({
  selector: 'app-tabela-todos-clientes',
  templateUrl: './tabela-todos-clientes.component.html',
  styleUrls: ['./tabela-todos-clientes.component.css'],
  standalone: true,
  imports: [CommonModule, FormatarCpfPipe],
})
export class TabelaTodosClientesComponent {
  clientes: ClienteDetalhesDTO[] = [];

  constructor(private clienteService: ClienteService) {
    this.carregarClientes();
  }

  carregarClientes() {
    this.clienteService
      .listarClientes('adm_relatorio_clientes')
      .subscribe((data) => {
        this.clientes = data;
      });
  }
}
