import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarGerente } from './editar-gerente';

describe('EditarGerente', () => {
  let component: EditarGerente;
  let fixture: ComponentFixture<EditarGerente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarGerente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarGerente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
