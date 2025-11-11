import { Admin } from "../admin/admin.interface";
import { Cliente } from "../cliente/cliente.interface";
import { Gerente } from "../gerente/gerente.interface";

export interface UserSession {
  token: string;
  tipo: 'CLIENTE' | 'GERENTE' | 'ADMINISTRADOR';
  usuario: Cliente | Gerente | Admin;
}
