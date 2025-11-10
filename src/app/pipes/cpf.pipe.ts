import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpf',
  standalone: true
})
export class CpfPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    
    // Remove tudo que não é número
    const cpf = value.replace(/\D/g, '');
    
    // Valida se tem 11 dígitos
    if (cpf.length !== 11) return value;
    
    // Formata: 999.999.999-99
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
