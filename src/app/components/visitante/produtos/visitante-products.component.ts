import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Licor } from '../../../models/licor.model';
import { ProdutoService } from '../../../services/produto.service';
import { fallbackImage } from '../shared/image-fallbacks';

type CatalogProduct = Licor;

interface CatalogFilters {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  flavor: string;
  tipo: string;
  rating: number;
}

@Component({
  selector: 'app-visitante-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './visitante-products.component.html',
  styleUrl: './visitante-products.component.css'
})
export class VisitanteProductsComponent implements OnInit {
  isLoading = true;
  loadError = false;
  errorMessage = '';
  allProducts: CatalogProduct[] = [];
  filteredProducts: CatalogProduct[] = [];
  visibleProducts: CatalogProduct[] = [];

  filters: CatalogFilters = {
    search: '',
    category: 'todos',
    minPrice: 0,
    maxPrice: 500,
    flavor: 'todos',
    tipo: 'todos',
    rating: 0
  };

  sortOption = 'destaque';
  availableCategories: string[] = [];
  availableFlavors: string[] = [];
  availableTypes: string[] = [];
  pageSize = 6;
  currentPage = 1;

  constructor(private readonly produtoService: ProdutoService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  retryLoad(): void {
    this.fetchProducts();
  }

  setCategory(category: string): void {
    this.filters.category = category;
    this.applyFilters(true);
  }

  applyFilters(resetPagination = false): void {
    let items = [...this.allProducts];
    const search = this.filters.search.trim().toLowerCase();

    items = items.filter(product => {
      const categories = this.getCategories(product);
      const flavor = this.getFlavor(product);
      const type = this.getType(product);
      const rating = this.getRating(product);
      const preco = typeof product.preco === 'number' ? product.preco : 0;

      const matchesSearch = !search || product.nome?.toLowerCase().includes(search);
      const matchesCategory =
        this.filters.category === 'todos' || categories.includes(this.filters.category);
      const matchesPrice = preco >= this.filters.minPrice && preco <= this.filters.maxPrice;
      const matchesFlavor = this.filters.flavor === 'todos' || flavor === this.filters.flavor;
      const matchesType = this.filters.tipo === 'todos' || type === this.filters.tipo;
      const matchesRating = !this.filters.rating || rating >= this.filters.rating;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesFlavor &&
        matchesType &&
        matchesRating
      );
    });

    items = this.sortProducts(items, this.sortOption);

    this.filteredProducts = items;

    if (resetPagination) {
      this.currentPage = 1;
    }

    this.updateVisibleProducts();
  }

  loadMore(): void {
    this.currentPage += 1;
    this.updateVisibleProducts();
  }

  hasMore(): boolean {
    return this.currentPage * this.pageSize < this.filteredProducts.length;
  }

  trackById(_: number, product: CatalogProduct): number | undefined {
    return product.id;
  }

  formatCurrency(value?: number): string {
    if (typeof value !== 'number') {
      return 'Sob consulta';
    }

    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  productImage(product: CatalogProduct, index: number): string {
    if (product.imagens && product.imagens.length) {
      return product.imagens[0];
    }

    return fallbackImage(index);
  }

  stockLabel(product: CatalogProduct): string {
    if (typeof product.estoque === 'number') {
      return `${product.estoque} em estoque`;
    }

    return 'Estoque sob consulta';
  }

  displayRating(product: CatalogProduct): string {
    return this.getRating(product).toFixed(1);
  }

  getCategories(product: CatalogProduct): string[] {
    return (product.categorias ?? [])
      .map(categoria => categoria.nome || categoria.descricao || '')
      .filter(Boolean);
  }

  getFlavor(product: CatalogProduct): string {
    return product.sabor?.nome ?? 'Autorais';
  }

  getType(product: CatalogProduct): string {
    if (!product.tipo) {
      return 'Especial';
    }
    return product.tipo
      .toString()
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/(^|\s)\S/g, char => char.toUpperCase());
  }

  getRating(product: CatalogProduct): number {
    if (product.estrelas) {
      return product.estrelas;
    }
    if (product.avaliacoes && product.avaliacoes.length) {
      const total = product.avaliacoes.reduce((sum, avaliacao) => sum + (avaliacao.estrelas || 0), 0);
      return total / product.avaliacoes.length;
    }
    return 0;
  }

  onPriceChange(): void {
    this.filters.minPrice = Number(this.filters.minPrice) || 0;
    this.filters.maxPrice = Number(this.filters.maxPrice) || this.filters.minPrice;
    if (this.filters.minPrice > this.filters.maxPrice) {
      this.filters.maxPrice = this.filters.minPrice;
    }
    this.applyFilters(true);
  }

  private fetchProducts(): void {
    this.isLoading = true;
    this.loadError = false;
    this.errorMessage = '';

    this.produtoService.getVisiveis().subscribe({
      next: products => this.initializeCatalog(products),
      error: () => {
        this.isLoading = false;
        this.loadError = true;
        this.errorMessage =
          'Nao foi possivel carregar os produtos agora. Verifique o endpoint /licor/visiveis.';
        this.allProducts = [];
        this.filteredProducts = [];
        this.visibleProducts = [];
      }
    });
  }

  private initializeCatalog(data?: Licor[] | Licor | null): void {
    const dataset = Array.isArray(data) ? data : [];
    this.allProducts = dataset.map(product => ({ ...product }));

    this.availableCategories = this.collectOptions(this.allProducts, this.getCategories.bind(this));
    this.availableFlavors = this.collectOptions(this.allProducts, item => [this.getFlavor(item)]);
    this.availableTypes = this.collectOptions(this.allProducts, item => [this.getType(item)]);

    const prices = this.allProducts
      .map(item => (typeof item.preco === 'number' ? item.preco : undefined))
      .filter((price): price is number => typeof price === 'number');

    if (prices.length) {
      this.filters.minPrice = Math.min(...prices);
      this.filters.maxPrice = Math.max(...prices);
    } else {
      this.filters.minPrice = 0;
      this.filters.maxPrice = 0;
    }

    this.isLoading = false;
    this.applyFilters(true);
  }

  private collectOptions(
    products: CatalogProduct[],
    extractor: (product: CatalogProduct) => string[]
  ): string[] {
    const values = new Set<string>();
    products.forEach(product => {
      extractor(product)
        .filter(Boolean)
        .forEach(value => values.add(value));
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  private sortProducts(products: CatalogProduct[], sortOption: string): CatalogProduct[] {
    const sorted = [...products];
    switch (sortOption) {
      case 'precoAsc':
        return sorted.sort((a, b) => (a.preco ?? 0) - (b.preco ?? 0));
      case 'precoDesc':
        return sorted.sort((a, b) => (b.preco ?? 0) - (a.preco ?? 0));
      case 'nome':
        return sorted.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      default:
        return sorted;
    }
  }

  private updateVisibleProducts(): void {
    this.visibleProducts = this.filteredProducts.slice(0, this.currentPage * this.pageSize);
  }
}
