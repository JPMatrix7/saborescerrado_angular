import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/usuario.model';
import { Perfil } from '../../../models/enums.model';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatChipsModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css'
})
export class UsuarioListComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  displayedColumns: string[] = ['id', 'nomeCompleto', 'email', 'cpf', 'perfil', 'status', 'dataInclusao', 'acoes'];
  
  // Paginação
  totalElements = signal(0);
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50];

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('UsuarioListComponent - ngOnInit chamado');
    this.loadUsuarios();
    this.loadTotal();
  }

  loadUsuarios(): void {
    console.log(`Carregando usuários - Página: ${this.pageIndex}, Tamanho: ${this.pageSize}`);
    this.usuarioService.getAll(this.pageIndex, this.pageSize).subscribe({
      next: (data) => {
        console.log('✅ Usuários carregados:', data);
        this.usuarios.set(data);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar usuários:', error);
        this.snackBar.open('Erro ao carregar usuários', 'OK', { duration: 3000 });
        // Fallback para dados estáticos em caso de erro
        this.loadStaticData();
      }
    });
  }

  loadTotal(): void {
    this.usuarioService.count().subscribe({
      next: (total) => {
        console.log('✅ Total de usuários:', total);
        this.totalElements.set(total);
      },
      error: (error) => {
        console.error('❌ Erro ao contar usuários:', error);
        this.totalElements.set(0);
      }
    });
  }

  loadStaticData(): void {
    // Dados estáticos para demonstração quando API está offline
    const usuariosEstaticos: Usuario[] = [
      {
        id: 1,
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        perfis: [Perfil.ADMIN],
        ativo: true,
        datainclusao: '2025-11-01T10:30:00',
        telefones: [],
        enderecos: [],
        cartoes: []
      },
      {
        id: 2,
        nome: 'Maria Santos',
        email: 'maria.santos@email.com',
        perfis: [Perfil.USER],
        ativo: true,
        datainclusao: '2025-11-02T14:15:00',
        telefones: [],
        enderecos: [],
        cartoes: []
      },
      {
        id: 3,
        nome: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        perfis: [Perfil.USER],
        ativo: false,
        datainclusao: '2025-11-03T09:00:00',
        telefones: [],
        enderecos: [],
        cartoes: []
      }
    ];
    this.usuarios.set(usuariosEstaticos);
    this.totalElements.set(3);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsuarios();
  }

  navigateToForm(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/usuarios/form', id]);
    } else {
      this.router.navigate(['/admin/usuarios/form']);
    }
  }

  deleteUsuario(id: number, nome: string): void {
    if (confirm(`Tem certeza que deseja desativar o usuário "${nome}"?`)) {
      console.log('Desativando usuário:', id);
      this.usuarioService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Usuário desativado com sucesso!', 'OK', { duration: 3000 });
          this.loadUsuarios();
          this.loadTotal();
        },
        error: (error) => {
          console.error('❌ Erro ao desativar usuário:', error);
          this.snackBar.open('Erro ao desativar usuário', 'OK', { duration: 3000 });
        }
      });
    }
  }

  getPerfilLabel(perfis?: Perfil[]): string {
    if (!perfis || perfis.length === 0) return 'Sem perfil';
    return perfis.map(p => {
      switch(p) {
        case Perfil.ADMIN: return 'Admin';
        case Perfil.USER: return 'Usuário';
        default: return 'Desconhecido';
      }
    }).join(', ');
  }

  getPerfilColor(perfis?: Perfil[]): string {
    if (!perfis || perfis.length === 0) return '';
    return perfis.includes(Perfil.ADMIN) ? 'primary' : 'accent';
  }

  getStatusLabel(ativo?: boolean): string {
    return ativo !== false ? 'Ativo' : 'Inativo';
  }

  getStatusColor(ativo?: boolean): string {
    return ativo !== false ? 'accent' : 'warn';
  }

  formatCpf(cpf?: string): string {
    if (!cpf) return '-';
    // Formata CPF: 12345678901 -> 123.456.789-01
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatData(data?: string): string {
    if (!data) return '-';
    const date = new Date(data);
    return date.toLocaleString('pt-BR');
  }

  voltar(): void {
    this.location.back();
  }
}
