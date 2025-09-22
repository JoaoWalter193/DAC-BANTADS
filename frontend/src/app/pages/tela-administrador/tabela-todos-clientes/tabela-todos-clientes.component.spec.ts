import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaTodosClientesComponent } from './tabela-todos-clientes.component';

describe('TabelaTodosClientesComponent', () => {
  let component: TabelaTodosClientesComponent;
  let fixture: ComponentFixture<TabelaTodosClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaTodosClientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaTodosClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
