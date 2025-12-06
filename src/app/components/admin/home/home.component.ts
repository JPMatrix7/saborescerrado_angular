import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ProdutoService } from '@services/produto.service';
import { UsuarioService } from '@services/usuario.service';
import { Produto } from '@models/produto.model';
import { Usuario } from '@models/usuario.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  // Dados simplificados
  totalProdutos = signal(0);
  totalUsuarios = signal(0);
  
  menuItems = [
    { title: 'Produtos', icon: 'inventory', route: '/admin/produtos', description: 'Gerencie os licores disponíveis' },
    { title: 'Categorias', icon: 'category', route: '/admin/categorias', description: 'Organize os tipos de licores' },
    { title: 'Fornecedores', icon: 'business', route: '/admin/fornecedores', description: 'Cadastre fornecedores' },
    { title: 'Usuários', icon: 'people', route: '/admin/usuarios', description: 'Gerencie usuários' },
    { title: 'Pedidos', icon: 'shopping_cart', route: '/admin/pedidos', description: 'Acompanhe os pedidos' }
  ];

  constructor(
    private router: Router,
    private produtoService: ProdutoService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Busca produtos (bebidas)
    console.log('Iniciando carregamento de produtos...');
    this.produtoService.findAll().subscribe({
      next: (produtos: Produto[]) => {
        this.totalProdutos.set(produtos.length);
        console.log('✅ Produtos carregados com sucesso:', produtos.length);
        console.log('Dados dos produtos:', produtos);
      },
      error: (error: unknown) => {
        console.error('❌ Erro ao carregar produtos:', error);
        console.error('Detalhes do erro:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        this.totalProdutos.set(0);
      }
    });

    // Busca usuários - com fallback para dados estáticos
    console.log('Iniciando carregamento de usuários...');
    this.usuarioService.findAll().subscribe({
      next: (usuarios: Usuario[] | Usuario | unknown) => {
        console.log('✅ Usuários carregados da API:', usuarios);
        console.log('Tipo de resposta:', typeof usuarios);
        console.log('É array?', Array.isArray(usuarios));
        
        if (Array.isArray(usuarios)) {
          this.totalUsuarios.set(usuarios.length);
          console.log('✅ Total de usuários definido:', usuarios.length);
        } else {
          console.warn('⚠️ Resposta não é um array, usando 0');
          this.totalUsuarios.set(0);
        }
      },
      error: (error: unknown) => {
        console.error('❌ Erro ao carregar usuários da API:', error);
        console.error('Status:', error.status);
        console.error('URL:', error.url);
        
        // Fallback: usar dados estáticos se API falhar
        console.log('📊 Usando dados estáticos de usuários');
        this.totalUsuarios.set(3); // 3 usuários estáticos da lista
      }
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
