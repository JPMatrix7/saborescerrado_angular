import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ProdutoService } from '../../../services/produto.service';
import { Produto } from '../../../models/produto.model';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './produto-list.component.html',
  styleUrl: './produto-list.component.css'
})
export class ProdutoListComponent implements OnInit {
  produtos = signal<Produto[]>([]);
  displayedColumns: string[] = ['id', 'nome', 'categoria', 'preco', 'estoque', 'acoes'];

  constructor(
    private produtoService: ProdutoService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadProdutos();
  }

  loadProdutos(): void {
    this.produtoService.findAll().subscribe({
      next: (data) => {
        console.log('Produtos carregados:', data);
        // Log para ver a estrutura das categorias
        if (data.length > 0) {
          console.log('Exemplo de produto:', data[0]);
          console.log('Categorias do primeiro produto:', data[0].categorias);
        }
        this.produtos.set(data);
      },
      error: (error) => console.error('Erro ao carregar produtos:', error)
    });
  }

  navigateToForm(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/produtos/form', id]);
    } else {
      this.router.navigate(['/admin/produtos/form']);
    }
  }

  deleteProduto(id: number): void {
    if (confirm('Deseja realmente excluir este produto?')) {
      this.produtoService.delete(id).subscribe({
        next: () => this.loadProdutos(),
        error: (error) => console.error('Erro ao excluir produto:', error)
      });
    }
  }

  voltar(): void {
    this.location.back();
  }
}
