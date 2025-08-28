import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Cliente {
  nome: string;
  saldo: number;
  cpf: string;
  email: string;
  salario: number;
  conta: number;
  limite: number;
  cpfGerente: string;
  nomeGerente: string;
}

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  standalone: true,
  styleUrl: './clientes.component.css',
  imports: [CommonModule],
})
export class ClientesComponent {
  clientes: Cliente[] = [
    {
      nome: 'João Silva',
      cpf: '123.456.789-00',
      email: 'joaosilva@hotmail.com',
      salario: 3000,
      conta: 11111,
      saldo: 1500,
      limite: 500,
      cpfGerente: '987.654.321-00',
      nomeGerente: 'Maria Souza',
    },
    {
      nome: 'Ana Pereira',
      cpf: '234.567.890-11',
      email: 'anapereira@gmail.com',
      salario: 4200,
      conta: 22222,
      saldo: 3200,
      limite: 800,
      cpfGerente: '876.543.210-11',
      nomeGerente: 'Carlos Lima',
    },
    {
      nome: 'Pedro Santos',
      cpf: '345.678.901-22',
      email: 'pedrosantos@yahoo.com',
      salario: 2800,
      conta: 33333,
      saldo: 900,
      limite: 400,
      cpfGerente: '765.432.109-22',
      nomeGerente: 'Fernanda Costa',
    },
    {
      nome: 'Mariana Oliveira',
      cpf: '456.789.012-33',
      email: 'mariana.oliveira@outlook.com',
      salario: 3500,
      conta: 44444,
      saldo: 2100,
      limite: 600,
      cpfGerente: '654.321.098-33',
      nomeGerente: 'Roberto Alves',
    },
  ];
}
