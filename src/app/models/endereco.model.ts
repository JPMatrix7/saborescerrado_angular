export interface Estado {
  id?: number;
  nome: string;
  sigla: string;
  ativo?: boolean;
  datainclusao?: Date;
}

export interface Cidade {
  id?: number;
  nome: string;
  estado?: Estado | number; // Pode ser objeto ou ID
  ativo?: boolean;
  datainclusao?: Date;
}

export interface Endereco {
  id?: number;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidade?: Cidade;
  cidadeId?: number;
}

export interface EnderecoPayload {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidadeId: number;
}
