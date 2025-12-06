export interface LoginRequest {
  email: string;
  senha: string;
}

export interface UsuarioAuth {
  id: number;
  nome: string;
  email: string;
  perfis: string[];
}

export interface LoginResponse {
  tokenType: string;
  token: string;
  expiresIn?: number;
  usuario: UsuarioAuth;
}

export interface CadastroPFRequest {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  cpf: string;
  dataNascimento: string;
  enderecosIds?: number[];
  telefonesIds?: number[];
  cartoesIds?: number[];
}

export interface CadastroPJRequest {
  nome: string;
  email: string;
  senha: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
}
