import { Categoria } from './categoria.model';
import { ParceiroComercial } from './fornecedor.model';
import { TipoLicor } from './enums.model';
import { Cidade } from './endereco.model';

export interface Sabor {
  id?: number;
  nome: string;
}

export interface Ingrediente {
  id?: number;
  nome: string;
  quantidade: number;
  unidadeMedida: string; // ex: ml, g, kg, L
}

export interface Embalagem {
  id?: number;
  volume: number; // em ml
  material: string; // ex: Vidro, PET, Alumínio
}

export interface SafraLicor {
  id?: number;
  anoSafra: Date;
  fazenda: string;
  qualidade: string; // ex: Premium, Standard, Extra
  cidade?: Cidade;
}

export interface Premiacao {
  id?: number;
  evento: string;
  ano: number;
  medalha: string; // ex: Ouro, Prata, Bronze
}

export interface Avaliacao {
  id?: number;
  estrelas: number; // 1 a 5
  comentario?: string;
  dataAvaliacao?: Date;
  nomeUsuario?: string;
}

export interface Licor {
  id?: number;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  imagens?: string[]; // URLs das imagens
  avaliacoes?: Avaliacao[];
  categorias?: Categoria[];
  estrelas?: number; // Média das avaliações
  visivel?: boolean;
  teorAlcoolico: number;
  safra?: SafraLicor;
  premiacoes?: Premiacao[];
  sabor?: Sabor;
  ingredientes?: Ingrediente[];
  embalagem?: Embalagem;
  tipo?: TipoLicor;
  parceiroComercial?: ParceiroComercial;
}
