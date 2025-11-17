import { CommonModule, registerLocaleData } from '@angular/common';
import { Component } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/extra/pt';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../models/cliente/cliente.interface';
import { ClienteService } from '../../../services/cliente.service';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';

registerLocaleData(localePt, 'pt-BR', localePtExtra);

@Component({
  selector: 'app-aprovar-cliente',
  imports: [CommonModule, FormatarCpfPipe, FormsModule],
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
    this.clientesService.listarClientes();
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
    this.clientesService.aprovarCliente(cpf).subscribe(() => {
      this.getContasPendentes();
    });
  }

  clienteRejeicao: Cliente | null = null;
  motivoRejeicao: string = '';

  abrirRejeicao(cliente: Cliente) {
    this.clienteRejeicao = cliente;
  }

  cancelarRejeicao() {
    this.clienteRejeicao = null;
    this.motivoRejeicao = '';
  }

  confirmarRejeicao() {
    if (this.clienteRejeicao) {
      this.clientesService.rejeitarCliente(this.clienteRejeicao.cpf, { motivo: this.motivoRejeicao });
    }
  }
}
