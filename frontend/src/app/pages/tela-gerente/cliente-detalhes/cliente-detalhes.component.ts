import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { ClienteDetalhesDTO } from '../../../models/cliente/dto/cliente-detalhes.dto';

@Component({
  selector: 'app-cliente-detalhes',
  templateUrl: './cliente-detalhes.component.html',
  styleUrls: ['./cliente-detalhes.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ClienteDetalhesComponent implements OnInit {
  cliente!: ClienteDetalhesDTO;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    const cpf = this.route.snapshot.paramMap.get('cpf');

    const cliente = this.clienteService.consultarCliente(cpf);
  }

  isSaldoNegativo(): boolean {
    return (this.cliente?.saldo ?? 0) < 0;
  }

  voltar() {
    this.router.navigate(['/tela-gerente/']);
  }
}
