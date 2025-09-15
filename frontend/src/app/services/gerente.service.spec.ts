import { TestBed } from '@angular/core/testing';

import { Gerente } from './gerente';

describe('Gerente', () => {
  let service: Gerente;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gerente);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
