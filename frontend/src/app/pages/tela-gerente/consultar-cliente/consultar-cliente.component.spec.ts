import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarClienteComponent } from './consultar-cliente.component';

describe('ConsultarClienteComponent', () => {
  let component: ConsultarClienteComponent;
  let fixture: ComponentFixture<ConsultarClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
