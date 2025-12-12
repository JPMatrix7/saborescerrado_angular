import { Licor } from './licor.model';
import { StatusPedido, FormaPagamento } from './enums.model';

export interface ItemCompra {
  id?: number;
  licor?: Licor;
  licorId?: number;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number; // Calculado: quantidade * precoUnitario
}

export interface Compra {
  id?: number;
  usuario?: any; // Usuario - evitando import circular
  dataCompra: Date;
  status: StatusPedido;
  enderecoId?: number;
  telefoneId?: number;
  formaPagamento: FormaPagamento;
  chavePix?: string;
  linhaDigitavelBoleto?: string;
  ultimosDigitosCartao?: string;
  nomeTitularCartao?: string;
  bandeiraCartao?: string;
  valorTotal: number;
  codigoRastreio?: string;
  dataPrevista?: Date;
  dataEntrega?: Date;
  pago: boolean;
  itens: ItemCompra[];
}

export interface CompraPayload {
  usuarioId?: number; // Usado pelo ADMIN para criar compra para outro cliente
  enderecoId: number;
  telefoneId: number;
  formaPagamento: FormaPagamento;
  chavePix?: string;
  linhaDigitavelBoleto?: string;
  ultimosDigitosCartao?: string;
  nomeTitularCartao?: string;
  bandeiraCartao?: string;
  itens: Array<{
    licorId: number;
    quantidade: number;
    precoUnitario?: number | null;
  }>;
}
