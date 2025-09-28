import { CommonModule, registerLocaleData } from '@angular/common';
import { Component } from '@angular/core';
import { Cliente } from '../../../models';
import { FormatarCpfPipe } from '../../../pipes/formatar-cpf.pipe';
import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/extra/pt';
import { ClienteService } from '../../../services/cliente.service';
import { FormsModule } from '@angular/forms';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { MockService } from '../../../services/mock.service';

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

  emailStatus: 'enviando' | 'sucesso' | 'erro' | null = null;
  emailMessage: string = '';

  constructor(
    private clientesService: ClienteService,
    private mockService: MockService
  ) {}

  ngOnInit() {
    this.clientes = this.getContasPendentes();
  }

  getContasPendentes(): Cliente[] {
    const currentUserJSON = localStorage.getItem('currentUser');

    if (!currentUserJSON) {
      this.clientes = [];
      return [];
    }

    const gerente = JSON.parse(currentUserJSON).user;
    if (!gerente || !gerente.clientes) {
      this.clientes = [];
      return [];
    }

    this.clientes = (gerente.clientes || []).filter(
      (cliente: { status: string }) => cliente.status === 'pendente'
    );
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
    const conta = Math.floor(1000 + Math.random() * 9000).toString();
    const senha = Math.random().toString(36).slice(-8);

    const cliente = this.clientes.find(
      (c) => (c.cpf || '').replace(/\D/g, '') === cpf.replace(/\D/g, '')
    );
    if (!cliente) return;

    // atualiza status e dados da aprovação
    cliente.status = 'aprovado';
    cliente.conta = conta; // <-- ADICIONAR no cliente
    cliente.senha = senha;
    const limite = this.calcularLimite(cliente.salario);
    cliente.dataDecisao = new Date().toISOString();

    // atualiza cliente no mock
    this.clientesService.updateCliente(cliente);

    // cria conta no LS via MockService
    this.mockService.criarContaParaCliente(cliente, conta, limite, senha);

    // envia email
    const textMessage = `
      Olá ${cliente.nome},

      Sua conta foi aprovada com sucesso!

      Número da conta: ${conta}
      Senha: ${senha}
      Limite disponível: R$ ${limite}
      Data da aprovação: ${new Date(cliente.dataDecisao).toLocaleString()}

      Atenciosamente,
      Equipe DinDin Bank
      `;

    this.enviarEmail({
      to_email: cliente.email,
      email: cliente.email,
      title: 'Conta aprovada',
      name: cliente.nome,
      time: new Date(cliente.dataDecisao).toLocaleString(),
      text_message: textMessage,
    });

    this.refreshClientes();
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
    if (!this.clienteRejeicao) return;

    this.clienteRejeicao.status = 'rejeitado';
    this.clienteRejeicao.motivoRejeicao = this.motivoRejeicao;
    this.clienteRejeicao.dataDecisao = new Date().toISOString();

    this.clientesService.updateCliente(this.clienteRejeicao);

    this.enviarEmail({
      to_email: this.clienteRejeicao.email,
      email: this.clienteRejeicao.email,
      title: 'Conta rejeitada',
      name: this.clienteRejeicao.nome,
      time: new Date(this.clienteRejeicao.dataDecisao).toLocaleString('pt-BR'),
      text_message: `
        Olá ${this.clienteRejeicao.nome},

        Infelizmente sua solicitação foi rejeitada.
        Motivo: ${this.motivoRejeicao}
        Data da decisão: ${new Date(
          this.clienteRejeicao.dataDecisao
        ).toLocaleString('pt-BR')}
        Atenciosamente,
        Equipe DinDin Bank
      `,
    });

    this.cancelarRejeicao();

    this.refreshClientes();
  }

  enviarEmail(params: {
    to_email: string;
    email: string;
    title: string;
    name: string;
    time: string;
    text_message: string;
  }) {
    this.emailStatus = 'enviando';
    this.emailMessage = 'Enviando email...';

    emailjs
      .send('service_m8z1aqf', 'template_9915iqh', params, 'r4cznUW5Ez1keDEVA')
      .then((response: EmailJSResponseStatus) => {
        console.log(
          'E-mail enviado com sucesso!',
          response.status,
          response.text
        );
        this.emailStatus = 'sucesso';
        this.emailMessage = 'Email enviado com sucesso!';
      })
      .catch((err: unknown) => {
        console.error('Erro ao enviar e-mail:', err);
        this.emailStatus = 'erro';
        this.emailMessage = 'Falha ao enviar email.';
      });
  }

  refreshClientes() {
    this.clientes = this.getContasPendentes();
  }
}
