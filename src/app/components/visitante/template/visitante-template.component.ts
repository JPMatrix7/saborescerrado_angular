import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CarrinhoService } from '@services/carrinho.service';
import { CarrinhoComponent } from '../carrinho/carrinho.component';

interface VisitanteNavLink {
  label: string;
  route: string;
  fragment?: string;
}

@Component({
  selector: 'app-visitante-template',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, CarrinhoComponent],
  templateUrl: './visitante-template.component.html',
  styleUrl: './visitante-template.component.css'
})
export class VisitanteTemplateComponent {
  private authService = inject(AuthService);
  private carrinhoService = inject(CarrinhoService);
  protected readonly currentYear = new Date().getFullYear();
  protected menuOpen = signal(false);
  protected cartOpen = signal(false);
  protected cartCount = signal(0);

  protected navigation: VisitanteNavLink[] = [
    { label: 'Inicio', route: '/', fragment: 'hero' },
    { label: 'Produtos', route: '/produtos' },
    { label: 'Categorias', route: '/', fragment: 'categorias' }
  ];

  constructor() {
    this.carrinhoService.items$.subscribe(items => this.cartCount.set(items.reduce((sum, i) => sum + i.quantidade, 0)));
    this.carrinhoService.open$.subscribe(() => this.cartOpen.set(true));
  }

  toggleMenu(): void {
    this.menuOpen.update(value => !value);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleCart(): void {
    this.cartOpen.update(value => !value);
  }

  closeCart(): void {
    this.cartOpen.set(false);
  }
}
