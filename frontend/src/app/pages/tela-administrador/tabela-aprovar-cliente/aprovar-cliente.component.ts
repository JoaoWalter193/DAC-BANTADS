import { CommonModule, registerLocaleData } from '@angular/common';
import { Component } from '@angular/core';
import { Cliente } from '../../../models';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/extra/pt';

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

  ngOnInit() {
    this.clientes = this.getContasPendentes();
  }

  getContasPendentes(): Cliente[] {
    const contasString = localStorage.getItem('clientes_bantads');

    if (!contasString) {
      return [];
    }

    const clientes: Cliente[] = JSON.parse(contasString);
    return clientes.filter((cliente) => cliente.status === 'pendente');
  }

  calcularLimite(salario: number): number {
    if (salario < 2000) {
      return 0;
    } else {
      return salario / 2;
    }
  }

  aprovar(cpf: string) {
    let clientes: Cliente[] = JSON.parse(
      localStorage.getItem('clientes_bantads') || '[]'
    );

    clientes = clientes.map((cliente) => {
      return cliente.cpf === cpf ? { ...cliente, status: 'aprovado' } : cliente;
    });

    localStorage.setItem('clientes_bantads', JSON.stringify(clientes));

    this.clientes = this.getContasPendentes();
  }

  rejeitar(cpf: string) {
    let clientes: Cliente[] = JSON.parse(
      localStorage.getItem('clientes_bantads') || '[]'
    );

    clientes = clientes.map((cliente) => {
      return cliente.cpf === cpf
        ? { ...cliente, status: 'rejeitado' }
        : cliente;
    });

    localStorage.setItem('clientes_bantads', JSON.stringify(clientes));
    this.clientes = this.getContasPendentes();
  }
}
