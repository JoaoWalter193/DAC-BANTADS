import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaGerenteDashboardComponent } from './tela-gerente-dashboard.component';

describe('TelaGerenteDashboardComponent', () => {
  let component: TelaGerenteDashboardComponent;
  let fixture: ComponentFixture<TelaGerenteDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaGerenteDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TelaGerenteDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
