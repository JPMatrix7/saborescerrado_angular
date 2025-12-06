import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ProdutoService } from '@services/produto.service';
import { Produto } from '@models/produto.model';

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
        console.log('✅ Produtos carregados:', data);
        // Log detalhado para debug
        if (data.length > 0) {
          console.log('📦 Primeiro produto completo:', data[0]);
          console.log('🏷️ Categorias:', data[0].categorias);
          console.log('🏷️ Tipo de categorias:', typeof data[0].categorias);
          console.log('🏷️ É array?', Array.isArray(data[0].categorias));
          if (data[0].categorias && data[0].categorias.length > 0) {
            console.log('🏷️ Primeira categoria:', data[0].categorias[0]);
          }
        }
        this.produtos.set(data);
      },
      error: (error: unknown) => {
        console.error('❌ Erro ao carregar produtos:', error);
      }
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
        error: (error: unknown) => console.error('Erro ao excluir produto:', error)
      });
    }
  }

  getCategoriaNome(produto: Produto): string {
    // Tenta várias formas de acessar a categoria
    if (produto.categorias && produto.categorias.length > 0) {
      return produto.categorias[0].nome || '-';
    }
    if ((produto as any).categoria?.nome) {
      return (produto as any).categoria.nome;
    }
    return '-';
  }

  voltar(): void {
    this.location.back();
  }
}
