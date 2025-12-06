import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-template',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatDividerModule
  ],
  templateUrl: './admin-template.component.html',
  styleUrl: './admin-template.component.css'
})
export class AdminTemplateComponent {
  protected readonly title = signal('Sabores do Cerrado - Admin');
  protected readonly currentYear = new Date().getFullYear();
  protected menuOpen = signal(false);

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update(value => !value);
  }
}
