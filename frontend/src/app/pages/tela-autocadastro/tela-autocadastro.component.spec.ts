import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaAutocadastroComponent } from './tela-autocadastro.component';

describe('TelaAutocadastroComponent', () => {
  let component: TelaAutocadastroComponent;
  let fixture: ComponentFixture<TelaAutocadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaAutocadastroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TelaAutocadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
