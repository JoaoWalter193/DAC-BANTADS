import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ContaService } from '../../services/conta.service';
import { ExtratoComponent } from '../../modals/extrato/extrato.component';
import { Conta } from '../../models/conta/conta.interface';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ClienteService } from '../../services/cliente.service';
import { ClienteDetalhesDTO } from '../../models/cliente/dto/cliente-detalhes.dto';

@Component({
  selector: 'app-home-cliente',
  imports: [
    MatIconModule,
    MatTableModule,
    CommonModule,
    RouterLink,
    NavbarComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './home-cliente.html',
  styleUrl: './home-cliente.css',
})
export class HomeCliente implements OnInit {
  cliente!: ClienteDetalhesDTO;
  operacaoAtiva: 'saque' | 'deposito' | 'transferencia' | 'extrato' | '' = '';
  valorSaque: number | null = null;
  valorDeposito: number | null = null;
  valorTransferencia: number | null = null;
  contaDestino: string | null = null;
  formExtrato: FormGroup;
  cpf: string = '12345678900'; // Ver a lógica pra poder passar CPF para essa tela - Lucas
  mensagem: string | null = null;
  tipoMensagem: 'sucesso' | 'erro' | null = null;

  constructor(
    private contaService: ContaService,
    private clienteService: ClienteService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.formExtrato = this.formBuilder.group({
      dataInicio: [null, Validators.required],
      dataFim: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.clienteService.consultarCliente(this.cpf).subscribe((data) => {
      this.cliente = data;
    });
  }

  expandirOperacao(
    operacao: 'saque' | 'deposito' | 'transferencia' | 'extrato' | '' = ''
  ): void {
    this.limparMensagem();
    if (this.operacaoAtiva === operacao) {
      this.operacaoAtiva = '';
    } else {
      this.operacaoAtiva = operacao;
    }
  }

  realizarSaque(): void {
    if (!this.valorSaque || this.valorSaque <= 0) {
      this.mostrarMensagem('Insira um valor positivo.', 'erro');
      return;
    }

    try {
      this.contaService.sacar(this.cliente.conta || '', this.valorSaque);
      this.valorSaque = null;
    } catch (error: any) {
      this.mostrarMensagem(error.message, 'erro');
    }
  }

  realizarDeposito(): void {
    if (!this.valorDeposito || this.valorDeposito <= 0) {
      this.mostrarMensagem('Insira um valor positivo.', 'erro');
      return;
    }

    try {
      this.contaService.depositar(this.cliente.conta || '', this.valorDeposito);
      this.valorDeposito = null;
    } catch (error: any) {
      this.mostrarMensagem(error.message, 'erro');
    }
  }

  realizarTransferencia(): void {
    if (!this.valorTransferencia || !this.contaDestino) {
      this.mostrarMensagem(
        'Por favor, insira o valor e o numero da conta destino.',
        'erro'
      );
      return;
    }

    try {
      this.contaService.transferir(
        this.cliente.conta || '',
        this.contaDestino,
        this.valorTransferencia
      );
      this.valorTransferencia = null;
      this.contaDestino = null;
    } catch (error: any) {
      this.mostrarMensagem(error.message, 'erro');
    }
  }

  gerarExtrato(): void {
    this.contaService.obterExtrato(this.cliente.conta || '');
  }

  private mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
  }

  private limparMensagem() {
    this.mensagem = null;
    this.tipoMensagem = null;
  }
}
