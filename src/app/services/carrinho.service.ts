import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, tap, catchError, map } from 'rxjs';
import { CarrinhoItem } from '@models/carrinho.model';
import { Licor } from '@models/licor.model';
import { AuthService } from './auth.service';

interface CartApiResponse {
  items?: Array<{
    id: number;
    product?: Licor;
    productId?: number;
    quantity: number;
    unitPrice?: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private storageKey = 'carrinho';
  private itemsSubject = new BehaviorSubject<CarrinhoItem[]>(this.loadFromStorage());
  private openSubject = new Subject<void>();
  private baseUrl = 'http://localhost:8080/carrinho';

  items$ = this.itemsSubject.asObservable();
  open$ = this.openSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  get items(): CarrinhoItem[] {
    return this.itemsSubject.getValue();
  }

  fetchCarrinho(): Observable<CarrinhoItem[]> {
    if (!this.authService.isAuthenticated()) {
      return of(this.items);
    }

    return this.http
      .get<CartApiResponse | CarrinhoItem[]>(this.baseUrl)
      .pipe(
        map((response) => this.mapApiResponse(response)),
        tap((mapped) => this.persist(mapped, false)),
        catchError(() => of(this.items))
      );
  }

  addItem(licor: Licor, quantidade: number = 1): void {
    if (!licor.id) return;

    if (!this.authService.isAuthenticated()) {
      this.addLocal(licor, quantidade);
      return;
    }

    this.http
      .post<CartApiResponse>(`${this.baseUrl}/item`, { licorId: licor.id, quantidade: quantidade })
      .subscribe({
        next: (response) => this.persist(this.mapApiResponse(response), false),
        error: () => this.addLocal(licor, quantidade)
      });
  }

  updateQuantity(licorId: number, quantidade: number): void {
    if (!this.authService.isAuthenticated()) {
      const items = this.items.map(item =>
        item.licor.id === licorId ? { ...item, quantidade: Math.max(1, quantidade) } : item
      );
      this.persist(items);
      return;
    }

    const item = this.items.find(i => i.licor.id === licorId);
    if (!item?.id) {
      // fallback local
      const items = this.items.map(i =>
        i.licor.id === licorId ? { ...i, quantidade: Math.max(1, quantidade) } : i
      );
      this.persist(items);
      return;
    }

    this.http
      .put<CartApiResponse>(`${this.baseUrl}/item/${item.id}`, { quantidade: quantidade })
      .subscribe({
        next: (response) => this.persist(this.mapApiResponse(response), false),
        error: () => {
          const items = this.items.map(i =>
            i.licor.id === licorId ? { ...i, quantidade: Math.max(1, quantidade) } : i
          );
          this.persist(items);
        }
      });
  }

  remove(identifier: number): void {
    if (!this.authService.isAuthenticated()) {
      const items = this.items.filter(item => item.licor.id !== identifier && item.id !== identifier);
      this.persist(items);
      return;
    }

    this.http.delete<void>(`${this.baseUrl}/item/${identifier}`).subscribe({
      next: () => {
        const items = this.items.filter(item => item.id !== identifier && item.licor.id !== identifier);
        this.persist(items, false);
      },
      error: () => {
        const items = this.items.filter(item => item.id !== identifier && item.licor.id !== identifier);
        this.persist(items);
      }
    });
  }

  clear(): void {
    // Limpar o localStorage independente de autenticação
    this.clearLocalStorage();
    
    if (!this.authService.isAuthenticated()) {
      this.persist([], false);
      return;
    }

    this.http.delete<void>(this.baseUrl).subscribe({
      next: () => this.persist([], false),
      error: () => this.persist([], false)
    });
  }

  clearLocalStorage(): void {
    localStorage.removeItem(this.storageKey);
    this.itemsSubject.next([]);
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

  private addLocal(licor: Licor, quantidade: number): void {
    const items = [...this.items];
    const idx = items.findIndex(i => i.licor.id === licor.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantidade: items[idx].quantidade + quantidade, precoUnitario: licor.preco };
    } else {
      items.push({ licor, quantidade, precoUnitario: licor.preco });
    }
    this.persist(items);
  }

  private persist(items: CarrinhoItem[], persistLocal: boolean = true): void {
    this.itemsSubject.next(items);
    if (persistLocal) {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
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

  private mapApiResponse(response: CartApiResponse | CarrinhoItem[]): CarrinhoItem[] {
    if (Array.isArray(response)) return response;
    const items = response?.items || [];
    return items.map((apiItem) => ({
      id: apiItem.id,
      licor: apiItem.product || { id: apiItem.productId } as Licor,
      quantidade: apiItem.quantity,
      precoUnitario: apiItem.unitPrice
    }));
  }
}
