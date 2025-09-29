import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaGerenteComponent } from './tela-gerente.component';

describe('TelaGerenteComponent', () => {
  let component: TelaGerenteComponent;
  let fixture: ComponentFixture<TelaGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaGerenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TelaGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
