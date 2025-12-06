import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { CategoriaService } from '@services/categoria.service';
import { Categoria } from '@models/categoria.model';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './categoria-list.component.html',
  styleUrl: './categoria-list.component.css'
})
export class CategoriaListComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  displayedColumns: string[] = ['id', 'nome', 'descricao', 'acoes'];

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    console.log('CategoriaListComponent - ngOnInit chamado');
    this.loadCategorias();
  }

  loadCategorias(): void {
    console.log('Carregando categorias...');
    this.categoriaService.findAll().subscribe({
      next: (data: Categoria[]) => {
        console.log('Categorias recebidas:', data);
        this.categorias.set(data);
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar categorias:', error);
        if (error && typeof error === 'object') {
          const err = error as { status?: number; message?: string };
          console.error('Status:', err.status);
          console.error('Mensagem:', err.message);
        }
      }
    });
  }

  navigateToForm(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/categorias/form', id]);
    } else {
      this.router.navigate(['/admin/categorias/form']);
    }
  }

  deleteCategoria(id: number): void {
    if (confirm('Deseja realmente excluir esta categoria?')) {
      this.categoriaService.delete(id).subscribe({
        next: () => this.loadCategorias(),
        error: (error: unknown) => console.error('Erro ao excluir categoria:', error)
      });
    }
  }

  voltar(): void {
    this.location.back();
  }
}
