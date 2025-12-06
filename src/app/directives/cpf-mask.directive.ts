import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCpfMask]',
  standalone: true
})
export class CpfMaskDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    // Limita a 11 dígitos
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    // Aplica a máscara
    if (value.length <= 11) {
      value = this.formatCpf(value);
    }
    
    input.value = value;
    
    // Dispara o evento de input para atualizar o FormControl
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    
    if (value.length > 0 && value.length < 11) {
      // Se não tiver 11 dígitos, limpa a formatação parcial
      input.value = value;
    }
  }

  private formatCpf(value: string): string {
    if (value.length <= 3) {
      return value;
    } else if (value.length <= 6) {
      return `${value.substring(0, 3)}.${value.substring(3)}`;
    } else if (value.length <= 9) {
      return `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
    } else {
      return `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
    }
  }
}
