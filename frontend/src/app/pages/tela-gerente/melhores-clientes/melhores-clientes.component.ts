import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { ClienteService } from '../../../services/cliente.service';
import { ClienteDetalhesDTO } from '../../../models/cliente/dto/cliente-detalhes.dto';

@Component({
  selector: 'app-melhores-clientes',
  imports: [CommonModule, FormatarCpfPipe, FormsModule, RouterLink],
  templateUrl: './melhores-clientes.component.html',
  styleUrl: './melhores-clientes.component.css',
})
export class MelhoresClientesComponent {
  clientes: ClienteDetalhesDTO[] = [];
  filtro: string = '';

  constructor(private clienteService: ClienteService) {
    this.carregarClientes();
  }

  carregarClientes() {
    this.clienteService
      .listarClientes('melhores_clientes')
      .subscribe((data) => {
        this.clientes = data;
      });
  }
}
