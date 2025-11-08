import { Injectable } from '@angular/core';
import { Gerente } from '../models/gerente/gerente.interface';

@Injectable({
  providedIn: 'root',
})
export class GerenteService {
  private storageKey = 'gerentes_bantads';

  obterGerentes(): Gerente[] {
    const gerentesJSON = localStorage.getItem(this.storageKey);
    return gerentesJSON ? JSON.parse(gerentesJSON) : [];
  }

  salvarGerente(gerente: Gerente): void {
    const gerentes = this.obterGerentes();
    gerentes.push(gerente);
    localStorage.setItem(this.storageKey, JSON.stringify(gerentes));
  }

  cpfJaCadastrado(cpf: string): boolean {
    return this.obterGerentes().some((g) => g.cpf === cpf);
  }
}
