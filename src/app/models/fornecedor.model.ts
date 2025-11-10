import { Endereco } from './endereco.model';

export interface ParceiroComercial {
  id?: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  email: string;
  telefone: string;
  enderecos?: Endereco[];
}

// Alias para compatibilidade
export type Fornecedor = ParceiroComercial;
