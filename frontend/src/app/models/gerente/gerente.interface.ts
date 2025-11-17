export interface Gerente {
  cpf: string;
  nome: string;
  email: string;
  tipo: 'GERENTE' | 'ADMINISTRADOR';
  senha?: string;
  clientes?: any[]; // no dashboard a API retorna outro formato
}
