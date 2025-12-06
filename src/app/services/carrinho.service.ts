import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { CarrinhoItem } from '@models/carrinho.model';
import { Licor } from '@models/licor.model';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private storageKey = 'carrinho';
  private itemsSubject = new BehaviorSubject<CarrinhoItem[]>(this.loadFromStorage());
  private openSubject = new Subject<void>();

  items$ = this.itemsSubject.asObservable();
  open$ = this.openSubject.asObservable();

  get items(): CarrinhoItem[] {
    return this.itemsSubject.getValue();
  }

  fetchCarrinho(): Observable<CarrinhoItem[]> {
    // Mantém a lógica de carrinho no frontend; apenas retorna os itens locais.
    return of(this.items);
  }

  addItem(licor: Licor, quantidade: number = 1): void {
    if (!licor.id) return;
    const items = [...this.items];
    const idx = items.findIndex(i => i.licor.id === licor.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantidade: items[idx].quantidade + quantidade, precoUnitario: licor.preco };
    } else {
      items.push({ licor, quantidade, precoUnitario: licor.preco });
    }
    this.persist(items);
  }

  updateQuantity(licorId: number, quantidade: number): void {
    const items = this.items.map(item =>
      item.licor.id === licorId ? { ...item, quantidade: Math.max(1, quantidade) } : item
    );
    this.persist(items);
  }

  remove(identifier: number): void {
    const items = this.items.filter(item => item.licor.id !== identifier);
    this.persist(items);
  }

  clear(): void {
    this.persist([]);
  }

  requestOpen(): void {
    this.openSubject.next();
  }

  total(): number {
    return this.items.reduce(
      (sum, item) => sum + (item.precoUnitario ?? item.licor.preco ?? 0) * item.quantidade,
      0
    );
  }

  private persist(items: CarrinhoItem[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private loadFromStorage(): CarrinhoItem[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as CarrinhoItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
