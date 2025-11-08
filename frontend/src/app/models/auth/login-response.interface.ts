import { Admin } from "../admin/admin.interface";
import { Cliente } from "../cliente/cliente.interface";
import { Gerente } from "../gerente/gerente.interface";

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  tipo: 'CLIENTE' | 'GERENTE' | 'ADMINISTRADOR';
  usuario: Cliente | Gerente | Admin;
}