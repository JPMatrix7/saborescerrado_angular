import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarrinhoItem } from '@models/carrinho.model';
import { FormaPagamento } from '@models/enums.model';
import { AuthService } from '@services/auth.service';
import { CarrinhoService } from '@services/carrinho.service';
import { PedidoService } from '@services/pedido.service';

@Component({
  selector: 'app-carrinho-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrinho-page.component.html',
  styleUrl: './carrinho-page.component.css'
})
export class CarrinhoPageComponent implements OnInit {
  private readonly pendingCheckoutKey = 'pending_checkout';

  pagamento: FormaPagamento = FormaPagamento.CARTAO;
  pago = false;
  isCheckoutLoading = false;
  checkoutMessage = '';
  checkoutError = '';
  FormaPagamento = FormaPagamento;

  items = signal<CarrinhoItem[]>([]);
  total = computed(() =>
    this.items().reduce((sum, item) => sum + this.itemPrice(item) * item.quantidade, 0)
  );

  constructor(
    private carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.carrinhoService.items$.subscribe(items => this.items.set(items));
  }

  ngOnInit(): void {
    this.carrinhoService.fetchCarrinho().subscribe({ error: () => {} });
    this.resumePendingCheckout();
  }

  formatCurrency(value?: number): string {
    if (typeof value !== 'number') return '--';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  updateQty(item: CarrinhoItem, qty: number): void {
    const normalized = Math.max(1, qty || 1);
    if (!item.licor.id) return;
    this.carrinhoService.updateQuantity(item.licor.id, normalized);
  }

  remove(item: CarrinhoItem): void {
    const identifier = item.id ?? item.licor.id;
    if (!identifier) return;
    this.carrinhoService.remove(identifier);
  }

  checkout(): void {
    if (!this.authService.isAuthenticated()) {
      this.storePendingCheckout();
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/carrinho' } });
      return;
    }

    if (!this.items().length) return;
    if (!this.pagamento) {
      this.checkoutError = 'Escolha uma forma de pagamento.';
      return;
    }

    const itens = this.items()
      .filter(item => item.licor.id)
      .map(item => ({
        licorId: item.licor.id!,
        quantidade: item.quantidade,
        precoUnitario: this.itemPrice(item)
      }));

    if (!itens.length) {
      this.checkoutError = 'Adicione itens com estoque disponivel.';
      return;
    }

    this.isCheckoutLoading = true;
    this.checkoutMessage = '';
    this.checkoutError = '';

    this.pedidoService
      .incluir({
        formaPagamento: this.pagamento,
        itens,
        pago: this.pago,
        status: undefined,
        codigoRastreio: undefined,
        dataPrevista: undefined
      })
      .subscribe({
        next: () => {
          this.isCheckoutLoading = false;
          this.checkoutMessage = 'Compra criada com sucesso!';
          this.clearPendingCheckout();
          this.carrinhoService.clear();
          this.carrinhoService.fetchCarrinho().subscribe({ error: () => {} });
          setTimeout(() => this.router.navigate(['/usuario']), 1500);
        },
        error: (err: HttpErrorResponse & { friendlyMessage?: string }) => {
          this.isCheckoutLoading = false;
          if (err.status === 401) {
            this.storePendingCheckout();
            this.redirectToLogin(err);
            return;
          }
          this.checkoutError =
            err.error?.message || err.friendlyMessage || err.message || 'Erro ao criar compra.';
        }
      });
  }

  continueShopping(): void {
    this.router.navigate(['/produtos']);
  }

  private itemPrice(item: CarrinhoItem): number {
    return item.precoUnitario ?? item.licor.preco ?? 0;
  }

  private redirectToLogin(error?: HttpErrorResponse): void {
    const locationHeader = error?.headers?.get('Location') || error?.headers?.get('location');
    const returnHeader =
      error?.headers?.get('X-Return-Url') || error?.headers?.get('x-return-url');
    const returnUrl = returnHeader || this.extractReturnUrl(locationHeader) || '/carrinho';

    this.router.navigate(['/login'], {
      queryParams: { returnUrl }
    });
  }

  private extractReturnUrl(locationHeader?: string | null): string | null {
    if (!locationHeader) return null;
    try {
      const parsed = new URL(locationHeader, window.location.origin);
      return parsed.searchParams.get('returnUrl') || parsed.pathname;
    } catch {
      return null;
    }
  }

  private storePendingCheckout(): void {
    const payload = { pagamento: this.pagamento, pago: this.pago };
    sessionStorage.setItem(this.pendingCheckoutKey, JSON.stringify(payload));
  }

  private clearPendingCheckout(): void {
    sessionStorage.removeItem(this.pendingCheckoutKey);
  }

  private resumePendingCheckout(): void {
    const raw = sessionStorage.getItem(this.pendingCheckoutKey);
    if (!raw || !this.authService.isAuthenticated()) return;

    this.clearPendingCheckout();
    try {
      const parsed = JSON.parse(raw) as Partial<{ pagamento: FormaPagamento; pago: boolean }>;
      if (parsed.pagamento) this.pagamento = parsed.pagamento;
      if (typeof parsed.pago === 'boolean') this.pago = parsed.pago;
    } catch {
      // ignore parse errors
    }

    if (this.items().length) {
      this.checkout();
      return;
    }

    this.carrinhoService.fetchCarrinho().subscribe({
      next: () => this.checkout(),
      error: () => {}
    });
  }
}
