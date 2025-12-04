import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface VisitanteNavLink {
  label: string;
  route: string;
  fragment?: string;
}

@Component({
  selector: 'app-visitante-template',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './visitante-template.component.html',
  styleUrl: './visitante-template.component.css'
})
export class VisitanteTemplateComponent {
  protected readonly currentYear = new Date().getFullYear();
  protected menuOpen = signal(false);

  protected navigation: VisitanteNavLink[] = [
    { label: 'Inicio', route: '/', fragment: 'hero' },
    { label: 'Produtos', route: '/produtos' },
    { label: 'Categorias', route: '/', fragment: 'categorias' },
    { label: 'Sobre', route: '/', fragment: 'sobre' },
    { label: 'Avaliacoes', route: '/', fragment: 'depoimentos' }
  ];

  toggleMenu(): void {
    this.menuOpen.update(value => !value);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
