import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { ClienteService } from '../../services/cliente.service';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  // Dados dos gráficos
  totalProdutos = signal(0);
  totalUsuarios = signal(0);
  totalCategorias = signal(0);
  
  // Dados para visualização
  categoriasTop = signal<{nome: string, quantidade: number}[]>([]);
  
  usuariosPorPerfil = [
    { perfil: 'Clientes', quantidade: 0 },
    { perfil: 'Administradores', quantidade: 0 }
  ];
  
  menuItems = [
    { title: 'Produtos', icon: 'inventory', route: '/admin/produtos', description: 'Gerencie os licores disponíveis' },
    { title: 'Categorias', icon: 'category', route: '/admin/categorias', description: 'Organize os tipos de licores' },
    { title: 'Fornecedores', icon: 'business', route: '/admin/fornecedores', description: 'Cadastre fornecedores' },
    { title: 'Clientes', icon: 'people', route: '/admin/clientes', description: 'Gerencie clientes' },
    { title: 'Pedidos', icon: 'shopping_cart', route: '/admin/pedidos', description: 'Acompanhe os pedidos' }
  ];

  constructor(
    private router: Router,
    private produtoService: ProdutoService,
    private clienteService: ClienteService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Busca produtos
    this.produtoService.findAll().subscribe({
      next: (produtos) => {
        this.totalProdutos.set(produtos.length);
        console.log('Produtos carregados:', produtos.length);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.totalProdutos.set(0);
      }
    });

    // Busca usuários
    this.clienteService.findAll().subscribe({
      next: (usuarios) => {
        this.totalUsuarios.set(usuarios.length);
        this.usuariosPorPerfil = [
          { perfil: 'Clientes', quantidade: usuarios.length },
          { perfil: 'Administradores', quantidade: 0 }
        ];
        console.log('Usuários carregados:', usuarios.length);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.totalUsuarios.set(0);
      }
    });

    // Busca categorias
    this.categoriaService.findAll().subscribe({
      next: (categorias) => {
        this.totalCategorias.set(categorias.length);
        
        // Mapeia categorias com quantidade zero inicialmente
        const categoriasArray = categorias
          .slice(0, 3)
          .map(cat => ({ nome: cat.nome, quantidade: 0 }));
        
        this.categoriasTop.set(categoriasArray);
        console.log('Categorias carregadas:', categorias.length);
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.totalCategorias.set(0);
      }
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
