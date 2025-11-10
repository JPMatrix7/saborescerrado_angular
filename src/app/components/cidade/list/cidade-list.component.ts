import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { CidadeService } from '../../../services/cidade.service';
import { Cidade } from '../../../models/endereco.model';

@Component({
  selector: 'app-cidade-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './cidade-list.component.html',
  styleUrl: './cidade-list.component.css'
})
export class CidadeListComponent implements OnInit {
  cidades = signal<Cidade[]>([]);
  displayedColumns: string[] = ['id', 'nome', 'estado', 'acoes'];

  constructor(
    private cidadeService: CidadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCidades();
  }

  loadCidades(): void {
    this.cidadeService.findAll().subscribe({
      next: (data) => this.cidades.set(data),
      error: (error) => console.error('Erro ao carregar cidades:', error)
    });
  }

  navigateToForm(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/cidades/form', id]);
    } else {
      this.router.navigate(['/admin/cidades/form']);
    }
  }

  deleteCidade(id: number): void {
    if (confirm('Deseja realmente excluir esta cidade?')) {
      this.cidadeService.delete(id).subscribe({
        next: () => this.loadCidades(),
        error: (error) => console.error('Erro ao excluir cidade:', error)
      });
    }
  }

  getEstadoNome(cidade: Cidade): string {
    return typeof cidade.estado === 'object' && cidade.estado ? cidade.estado.nome : '-';
  }
}
