export interface TelefonePayload {
  codigoArea: string;
  numero: string;
}

export interface Telefone extends Partial<TelefonePayload> {
  id?: number;
  ddd?: string;
  tipo?: 'CELULAR' | 'FIXO' | 'COMERCIAL';
}
