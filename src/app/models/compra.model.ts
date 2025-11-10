import { Licor } from './licor.model';
import { StatusPedido, FormaPagamento } from './enums.model';

export interface ItemCompra {
  id?: number;
  licor: Licor;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number; // Calculado: quantidade * precoUnitario
}

export interface Compra {
  id?: number;
  usuario?: any; // Usuario - evitando import circular
  dataCompra: Date;
  status: StatusPedido;
  formaPagamento: FormaPagamento;
  valorTotal: number;
  codigoRastreio?: string;
  dataPrevista?: Date;
  dataEntrega?: Date;
  pago: boolean;
  itens: ItemCompra[];
}
