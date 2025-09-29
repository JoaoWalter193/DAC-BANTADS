import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroGerente } from './cadastro-gerente';

describe('CadastroGerente', () => {
  let component: CadastroGerente;
  let fixture: ComponentFixture<CadastroGerente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroGerente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroGerente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
