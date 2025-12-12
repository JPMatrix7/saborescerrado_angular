import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CarrinhoItem } from '@models/carrinho.model';
import { CarrinhoService } from '@services/carrinho.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrinho.component.html',
  styleUrl: './carrinho.component.css'
})
export class CarrinhoComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  items = signal<CarrinhoItem[]>([]);
  total = computed(() =>
    this.items().reduce((sum, item) => sum + this.itemPrice(item) * item.quantidade, 0)
  );

  constructor(
    private carrinhoService: CarrinhoService,
    private router: Router
  ) {
    this.carrinhoService.items$.subscribe(items => this.items.set(items));
  }

  formatCurrency(value?: number): string {
    if (typeof value !== 'number') return '--';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  remove(item: CarrinhoItem): void {
    const identifier = item.id ?? item.licor.id;
    if (!identifier) return;
    this.carrinhoService.remove(identifier);
  }

  increaseQty(item: CarrinhoItem): void {
    if (!item.licor.id) return;
    this.carrinhoService.updateQuantity(item.licor.id, item.quantidade + 1);
  }

  decreaseQty(item: CarrinhoItem): void {
    if (!item.licor.id || item.quantidade <= 1) return;
    this.carrinhoService.updateQuantity(item.licor.id, item.quantidade - 1);
  }

  updateQty(item: CarrinhoItem, qty: number): void {
    if (!item.licor.id) return;
    const normalized = Math.max(1, qty || 1);
    this.carrinhoService.updateQuantity(item.licor.id, normalized);
  }

  viewCart(): void {
    this.close.emit();
    this.router.navigate(['/carrinho']);
  }

  private itemPrice(item: CarrinhoItem): number {
    return item.precoUnitario ?? item.licor.preco ?? 0;
  }
}
