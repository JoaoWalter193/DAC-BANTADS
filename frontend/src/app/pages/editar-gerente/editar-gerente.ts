import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GerenteService } from '../../services/gerente.service';
import { AtualizarGerenteDTO } from '../../models/gerente/dto/gerente-atualizar.dto';

@Component({
  selector: 'app-editar-gerente',
  templateUrl: './editar-gerente.html',
  styleUrls: ['./editar-gerente.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class EditarGerente implements OnInit {
  form!: FormGroup;
  cpf: string = '';
  carregando: boolean = false;
  mensagem: string = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  constructor(
    private gerenteService: GerenteService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cpf = this.route.snapshot.paramMap.get('cpf') || '';

    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: [{ value: this.cpf, disabled: true }, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tipo: ['GERENTE', Validators.required],
      senha: [''],
    });

    if (this.cpf) {
      this.carregarDadosGerente(this.cpf);
    }
  }

  /**
   * Busca os dados do gerente e preenche o FormGroup (PATCH VALUE).
   * @param cpf CPF do gerente.
   */
  carregarDadosGerente(cpf: string): void {
    this.carregando = true;
    this.gerenteService.getGerenteByCpf(cpf).subscribe({
      next: (gerente) => {
        this.carregando = false;
        this.form.patchValue({
          nome: gerente.nome,
          email: gerente.email,
          tipo: gerente.tipo,
        });
        console.log('Dados do gerente carregados e preenchidos no formulário.');
      },
      error: (err) => {
        this.carregando = false;
        this.mensagem = 'Erro ao carregar dados do gerente.';
        this.tipoMensagem = 'erro';
        console.error('ERRO ao carregar gerente:', err);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.mensagem = 'Verifique os campos obrigatórios (Nome, E-mail, Tipo).';
      this.tipoMensagem = 'erro';
      return;
    }

    const formValue = this.form.getRawValue();

    const dto: AtualizarGerenteDTO & { senha?: string } = {
      nome: formValue.nome,
      email: formValue.email,
      tipo: formValue.tipo,
    };

    const senha = formValue.senha ? String(formValue.senha).trim() : '';

    if (senha) {
      dto.senha = senha;
      console.log('Senha será atualizada.');
    } else {
      console.log('Campo de senha vazio. A senha existente será mantida.');
    }

    this.carregando = true;
    this.gerenteService.atualizarGerente(this.cpf, dto).subscribe({
      next: (gerenteAtualizado) => {
        this.carregando = false;
        this.mensagem = `Gerente ${gerenteAtualizado.nome} atualizado com sucesso!`;
        this.tipoMensagem = 'sucesso';
      },
      error: (err) => {
        this.carregando = false;
        this.mensagem = 'Falha na atualização. Erro interno do servidor.';
        this.tipoMensagem = 'erro';
        console.error('Erro na atualização:', err);
      },
    });
  }

  voltarParaLista() {
    window.history.back();
  }
}
