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
  estadoId?: number;
  estado?: Estado;
  ativo?: boolean;
  datainclusao?: Date;
}

export interface EnderecoDTO {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidadeId: number;
}

export interface Endereco extends EnderecoDTO {
  id?: number;
  cidade?: Cidade;
}
