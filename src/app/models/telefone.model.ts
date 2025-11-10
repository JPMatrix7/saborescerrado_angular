export interface Telefone {
  id?: number;
  ddd: string;
  numero: string;
  tipo?: 'CELULAR' | 'FIXO' | 'COMERCIAL';
}
