import { Licor } from './licor.model';

export interface CarrinhoItem {
  id?: number; // id do item de carrinho retornado pelo backend
  licor: Licor;
  quantidade: number;
  precoUnitario?: number;
}

export interface CarrinhoPayloadItem {
  licorId: number;
  quantidade: number;
  precoUnitario?: number | null;
}

export interface CarrinhoResponseItem {
  id: number;
  quantidade: number;
  precoUnitario?: number;
  licor: Licor;
  compraId?: number;
}

export interface CarrinhoResponse {
  compraId?: number;
  sessaoId?: string;
  valorTotal?: number;
  autenticado?: boolean;
  itens: CarrinhoResponseItem[];
}
