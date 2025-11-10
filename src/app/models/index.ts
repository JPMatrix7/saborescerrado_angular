// Barrel export - Facilita importação dos models
export * from './enums.model';
export * from './endereco.model';
export * from './telefone.model';
export * from './cartao.model';
export * from './categoria.model';
export * from './fornecedor.model';
export * from './licor.model';
export * from './usuario.model';
export * from './compra.model';

// Aliases para compatibilidade
export type { ParceiroComercial as Fornecedor } from './fornecedor.model';
export type { Licor as Produto } from './licor.model';
export type { PessoaFisica as Cliente } from './usuario.model';
export type { Compra as Pedido } from './compra.model';
