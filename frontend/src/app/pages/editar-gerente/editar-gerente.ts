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
// Importação AtualizarGerenteDTO (assumida, use a sua)
import { AtualizarGerenteDTO } from '../../models/gerente/dto/gerente-atualizar.dto';

@Component({
  selector: 'app-editar-gerente',
  templateUrl: './editar-gerente.html',
  styleUrls: ['./editar-gerente.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class EditarGerente implements OnInit {
  // Propriedades do Componente
  form!: FormGroup; // O Formulário Reativo
  cpf: string = ''; // O CPF do gerente a ser editado (obtido da rota)
  carregando: boolean = false; // Indicador de carregamento
  mensagem: string = ''; // Para mensagens de feedback
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso'; // Tipo de feedback

  constructor(
    private gerenteService: GerenteService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cpf = this.route.snapshot.paramMap.get('cpf') || ''; // 1. Inicializa o FormGroup:

    // - CPF é preenchido mas desabilitado (ReadOnly)
    // - Senha não tem Validators.required (é opcional)
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: [{ value: this.cpf, disabled: true }, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tipo: ['GERENTE', Validators.required],
      senha: [''], // Senha é opcional
    }); // 2. Carrega os dados do gerente se o CPF for válido

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
        this.carregando = false; // Preenche os controles do formulário com os dados do gerente
        this.form.patchValue({
          nome: gerente.nome,
          email: gerente.email,
          tipo: gerente.tipo, // A senha não é preenchida por segurança
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

  /**
   * Manipula a submissão do formulário.
   * Contém a lógica para não enviar o campo 'senha' se estiver vazio.
   */
  onSubmit() {
    if (this.form.invalid) {
      this.mensagem = 'Verifique os campos obrigatórios (Nome, E-mail, Tipo).';
      this.tipoMensagem = 'erro';
      return;
    }

    // getRawValue() inclui o CPF desabilitado, mas o DTO final será filtrado
    const formValue = this.form.getRawValue();

    // 1. Cria o DTO base com os campos obrigatórios (e alteráveis)
    const dto: AtualizarGerenteDTO & { senha?: string } = {
      nome: formValue.nome,
      email: formValue.email,
      tipo: formValue.tipo,
    };

    // 2. Lógica da Senha Condicional (Mantendo a correção)
    const senha = formValue.senha ? String(formValue.senha).trim() : '';

    if (senha) {
      dto.senha = senha;
      console.log('Senha será atualizada.');
    } else {
      // Quando a senha está vazia, o campo 'senha' NÃO é enviado ao backend.
      console.log('Campo de senha vazio. A senha existente será mantida.');
    }

    // 3. Chama o Service
    this.carregando = true;
    this.gerenteService.atualizarGerente(this.cpf, dto).subscribe({
      next: (gerenteAtualizado) => {
        this.carregando = false;
        this.mensagem = `Gerente ${gerenteAtualizado.nome} atualizado com sucesso!`;
        this.tipoMensagem = 'sucesso'; // Opcional: Redirecionar após o sucesso
        // this.router.navigate(['/gerentes']);
      },
      error: (err) => {
        this.carregando = false;
        this.mensagem = 'Falha na atualização. Erro interno do servidor.';
        this.tipoMensagem = 'erro';
        console.error('Erro na atualização:', err);
      },
    });
  }

  /**
   * NOVO MÉTODO: Navega de volta para a tela anterior.
   */
  voltarParaLista() {
    window.history.back();
  }
}
