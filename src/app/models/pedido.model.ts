// Arquivo de compatibilidade - aponta para os novos nomes
export type { Compra as Pedido, ItemCompra as ItemPedido } from './compra.model';
export * from './compra.model';
export { StatusPedido } from './enums.model';
