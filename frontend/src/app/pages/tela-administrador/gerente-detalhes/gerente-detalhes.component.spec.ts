import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenteDetalhesComponent } from './gerente-detalhes.component';

describe('GerenteDetalhesComponent', () => {
  let component: GerenteDetalhesComponent;
  let fixture: ComponentFixture<GerenteDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenteDetalhesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerenteDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
