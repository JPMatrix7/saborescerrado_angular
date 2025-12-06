import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { FornecedorService } from '@services/fornecedor.service';
import { Fornecedor } from '@models/fornecedor.model';

@Component({
  selector: 'app-fornecedor-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './fornecedor-list.component.html',
  styleUrl: './fornecedor-list.component.css'
})
export class FornecedorListComponent implements OnInit {
  fornecedores = signal<Fornecedor[]>([]);
  displayedColumns: string[] = ['id', 'nome', 'cnpj', 'telefone', 'email', 'acoes'];

  constructor(
    private fornecedorService: FornecedorService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadFornecedores();
  }

  loadFornecedores(): void {
    this.fornecedorService.findAll().subscribe({
      next: (data: Fornecedor[]) => this.fornecedores.set(data),
      error: (error: unknown) => console.error('Erro ao carregar fornecedores:', error)
    });
  }

  navigateToForm(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/fornecedores/form', id]);
    } else {
      this.router.navigate(['/admin/fornecedores/form']);
    }
  }

  deleteFornecedor(id: number): void {
    if (confirm('Deseja realmente excluir este fornecedor?')) {
      this.fornecedorService.delete(id).subscribe({
        next: () => this.loadFornecedores(),
        error: (error: unknown) => console.error('Erro ao excluir fornecedor:', error)
      });
    }
  }

  voltar(): void {
    this.location.back();
  }
}
