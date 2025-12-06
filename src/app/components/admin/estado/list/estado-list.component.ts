import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { EstadoService } from '@services/estado.service';
import { Estado } from '@models/endereco.model';

@Component({
  selector: 'app-estado-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './estado-list.component.html',
  styleUrl: './estado-list.component.css'
})
export class EstadoListComponent implements OnInit {
  estados = signal<Estado[]>([]);
  displayedColumns: string[] = ['id', 'nome', 'sigla', 'acoes'];

  constructor(
    private estadoService: EstadoService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadEstados();
  }

  loadEstados(): void {
    this.estadoService.findAll().subscribe({
      next: (data: Estado[]) => this.estados.set(data),
      error: (error: unknown) => console.error('Erro ao carregar estados:', error)
    });
  }

  navigateToForm(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/estados/form', id]);
    } else {
      this.router.navigate(['/admin/estados/form']);
    }
  }

  deleteEstado(id: number): void {
    if (confirm('Deseja realmente excluir este estado?')) {
      this.estadoService.delete(id).subscribe({
        next: () => this.loadEstados(),
        error: (error: unknown) => console.error('Erro ao excluir estado:', error)
      });
    }
  }

  voltar(): void {
    this.location.back();
  }
}
