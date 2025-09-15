import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovarClienteComponent } from './aprovar-cliente.component';

describe('AprovarClienteComponent', () => {
  let component: AprovarClienteComponent;
  let fixture: ComponentFixture<AprovarClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovarClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprovarClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
