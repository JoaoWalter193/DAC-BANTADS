import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MelhoresClientesComponent } from './melhores-clientes.component';

describe('MelhoresClientesComponent', () => {
  let component: MelhoresClientesComponent;
  let fixture: ComponentFixture<MelhoresClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MelhoresClientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MelhoresClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
