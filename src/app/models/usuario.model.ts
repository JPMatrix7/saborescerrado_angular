import { Perfil } from './enums.model';
import { Endereco } from './endereco.model';
import { Cartao } from './cartao.model';
import { Telefone } from './telefone.model';

// Interface base Usuario
export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string; // Não deve ser retornado pela API
  perfis?: Perfil[];
  enderecos?: Endereco[];
  cartoes?: Cartao[];
  telefones?: Telefone[];
  favoritos?: any[]; // Licor[] - evitando import circular
  compras?: any[]; // Compra[] - evitando import circular
}

// Pessoa Física (Cliente)
export interface PessoaFisica extends Usuario {
  cpf: string;
  dataNascimento: Date;
  sobrenome: string;
}

// Pessoa Jurídica
export interface PessoaJuridica extends Usuario {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
}
