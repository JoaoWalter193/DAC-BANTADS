import { CommonModule, registerLocaleData } from '@angular/common';
import { Component } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/extra/pt';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import { ClienteAprovarDTO } from '../../../models/cliente/dto/cliente-aprovar.dto';
import { ClienteListaDTO } from '../../../models/cliente/dto/cliente-lista.dto';
import { ClienteRejeitarDTO } from '../../../models/cliente/dto/cliente-rejeitar.dto';

registerLocaleData(localePt, 'pt-BR', localePtExtra);

@Component({
  selector: 'app-aprovar-cliente',
  imports: [CommonModule, FormatarCpfPipe, FormsModule],
  templateUrl: './aprovar-cliente.component.html',
  styleUrl: './aprovar-cliente.component.css',
  providers: [{ provide: 'LOCALE_ID', useValue: 'pt-BR' }],
})
export class AprovarClienteComponent {
  clientes: ClienteListaDTO[] = [];
  limite: number = 0;

  constructor(private clientesService: ClienteService) {}

  ngOnInit() {
    this.getContasPendentes();
  }

  getContasPendentes() {
    this.clientesService.listarClientes('para_aprovar').subscribe((data) => {
      this.clientes = data;
    });
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

  clienteRejeicao: ClienteAprovarDTO | null = null;
  motivoRejeicao: string = '';

  abrirRejeicao(cliente: ClienteAprovarDTO) {
    this.clienteRejeicao = cliente;
    this.motivoRejeicao = '';
  }

  cancelarRejeicao() {
    this.clienteRejeicao = null;
    this.motivoRejeicao = '';
  }

  confirmarRejeicao() {
    if (this.clienteRejeicao && this.motivoRejeicao.trim()) {
      const rejeicaoDTO: ClienteRejeitarDTO = {
        motivo: this.motivoRejeicao,
      };

      this.clientesService
        .rejeitarCliente(
          this.clienteRejeicao.cpf,
          rejeicaoDTO // ✅ Passa o DTO, não a string
        )
        .subscribe({
          next: () => {
            console.log('Cliente rejeitado com sucesso');
            this.getContasPendentes();
            this.cancelarRejeicao();
          },
          error: (err) => {
            console.error('Erro ao rejeitar cliente:', err);
            alert('Erro ao rejeitar cliente. Tente novamente.');
          },
        });
    } else {
      alert('Por favor, informe o motivo da rejeição.');
    }
  }
}
