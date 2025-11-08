import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MockService } from '../../../services/mock.service';
import { Cliente } from '../../../models/cliente.interface';
import { Conta } from '../../../models/conta.interface';
import { Gerente } from '../../../models/gerente/gerente.interface';

@Component({
  selector: 'app-cliente-detalhes',
  templateUrl: './cliente-detalhes.component.html',
  styleUrls: ['./cliente-detalhes.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ClienteDetalhesComponent implements OnInit {
  cliente!: Cliente;
  conta!: Conta;
  gerente?: Gerente;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mockService: MockService
  ) {}

  ngOnInit(): void {
    const cpf = this.route.snapshot.paramMap.get('cpf');

    const clientes = this.mockService.getClientes();
    const contas: Conta[] = JSON.parse(
      localStorage.getItem('contaCliente') || '[]'
    );
    const gerentes: Gerente[] = this.mockService.getGerentes();

    if (cpf) {
      const c = clientes.find((c) => c.cpf === cpf);
      const contaEncontrada = contas.find((c) => c.cliente.cpf === cpf);
      if (c && contaEncontrada) {
        this.cliente = c;
        this.conta = contaEncontrada;
        this.gerente = gerentes.find((g) => g.nome === this.conta.nomeGerente);
      }
    }
  }

  isSaldoNegativo(): boolean {
    return (this.conta?.saldo ?? 0) < 0;
  }

  voltar() {
    this.router.navigate(['/tela-gerente/']);
  }
}
