export interface Cartao {
  id?: number;
  numero: string;
  nomeImpresso: string;
  validade: string; // formato MM/YY
  cvv: string;
  bandeira?: 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX';
}
