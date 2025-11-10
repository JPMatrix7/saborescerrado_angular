import { Perfil } from './enums.model';
import { Endereco } from './endereco.model';
import { Cartao } from './cartao.model';
import { Telefone } from './telefone.model';

// Interface completa retornada pela API GET /usuario/id/{id}
export interface Usuario {
  id?: number;
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  senha?: string; // Não deve ser retornado pela API
  perfis: Perfil[];
  ativo: boolean;
  dataInclusao: string;
  enderecos: Endereco[];
  cartoes: Cartao[];
  telefones: Telefone[];
  favoritos: any[]; // Licor[] - evitando import circular
  compras: any[]; // Compra[] - evitando import circular
}

// DTO para criar usuário (POST /usuario)
export interface UsuarioCreateDTO {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  dataNascimento: string; // ISO 8601: YYYY-MM-DD
  senha: string; // Obrigatório na criação
  perfis?: Perfil[]; // Opcional, default ["USER"]
}

// DTO para atualizar usuário (PUT /usuario/{id})
export interface UsuarioUpdateDTO {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  dataNascimento: string; // ISO 8601: YYYY-MM-DD
  senha?: string; // Opcional na edição
}

// Manter compatibilidade com código antigo
export interface PessoaFisicaDTO extends UsuarioUpdateDTO {
  perfis?: Perfil[];
}

// Pessoa Física (Cliente) - compatibilidade
export interface PessoaFisica extends Omit<Usuario, 'dataNascimento'> {
  dataNascimento: Date | string;
}

// Pessoa Jurídica
export interface PessoaJuridica extends Usuario {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
}
