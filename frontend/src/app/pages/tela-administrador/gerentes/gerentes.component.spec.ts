import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerentesComponent } from './gerentes.component';

describe('GerentesComponent', () => {
  let component: GerentesComponent;
  let fixture: ComponentFixture<GerentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
