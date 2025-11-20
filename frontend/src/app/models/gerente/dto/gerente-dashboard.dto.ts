export interface GerenteDashboardDTO {
  gerente: {
    cpf: string;
    nome: string;
    email: string;
    tipo: string;
    senha?: string;
  };
  clientes: {
    cliente: string;
    numero: string;
    saldo: number;
    limite: number;
    gerente: string;
    criacao: string;
  }[];
  saldo_positivo: number;
  saldo_negativo: number;
}
