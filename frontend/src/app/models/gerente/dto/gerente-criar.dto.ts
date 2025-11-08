export interface CriarGerenteDTO {
  cpf: string;
  nome: string;
  email: string;
  tipo: 'GERENTE' | 'ADMINISTRADOR';
  senha: string;
}
