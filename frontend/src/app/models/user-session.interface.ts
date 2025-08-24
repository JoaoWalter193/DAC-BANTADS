import { Cliente } from './cliente.interface';
import { Gerente } from './gerente.interface';
import { Admin } from './admin.interface';
import { Conta } from './conta.interface';

export interface UserSession {
  user: Cliente | Gerente | Admin;
  conta?: Conta;
}
