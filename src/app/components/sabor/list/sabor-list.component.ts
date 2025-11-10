import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SaborService } from '../../../services/sabor.service';
import { Sabor } from '../../../models/licor.model';

@Component({
  selector: 'app-sabor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './sabor-list.component.html',
  styleUrl: './sabor-list.component.css'
})
export class SaborListComponent implements OnInit {
  sabores = signal<Sabor[]>([]);
  displayedColumns: string[] = ['id', 'nome', 'acoes'];

  constructor(
    private saborService: SaborService,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('SaborListComponent - ngOnInit chamado');
    this.loadSabores();
  }

  loadSabores(): void {
    console.log('Carregando sabores...');
    this.saborService.findAll().subscribe({
      next: (data) => {
        console.log('Sabores recebidos:', data);
        this.sabores.set(data);
      },
      error: (error) => {
        console.error('Erro ao carregar sabores:', error);
        this.snackBar.open('Erro ao carregar sabores', 'OK', { duration: 3000 });
      }
    });
  }

  navigateToForm(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/sabores/form', id]);
    } else {
      this.router.navigate(['/admin/sabores/form']);
    }
  }

  deleteSabor(id: number): void {
    if (confirm('Tem certeza que deseja desativar este sabor?')) {
      this.saborService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Sabor desativado com sucesso!', 'OK', { duration: 3000 });
          this.loadSabores();
        },
        error: (error) => {
          console.error('Erro ao excluir sabor:', error);
          this.snackBar.open('Erro ao desativar sabor', 'OK', { duration: 3000 });
        }
      });
    }
  }

  voltar(): void {
    this.location.back();
  }
}
