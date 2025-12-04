import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Licor } from '../../../models/licor.model';
import { ProdutoService } from '../../../services/produto.service';

type CatalogProduct = Licor & {
  badge?: string;
  vendas?: number;
};

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
  protected isLoading = true;
  protected allProducts: CatalogProduct[] = [];
  protected filteredProducts: CatalogProduct[] = [];
  protected visibleProducts: CatalogProduct[] = [];

  protected filters: CatalogFilters = {
    search: '',
    category: 'todos',
    minPrice: 0,
    maxPrice: 500,
    flavor: 'todos',
    tipo: 'todos',
    rating: 0
  };

  protected sortOption = 'destaque';
  protected availableCategories: string[] = [];
  protected availableFlavors: string[] = [];
  protected availableTypes: string[] = [];
  protected pageSize = 6;
  protected currentPage = 1;

  private readonly sampleProducts: CatalogProduct[] = [
    {
      id: 1,
      nome: 'Licor de Buriti Reserva',
      descricao: 'Frutado intenso com final citrico leve.',
      preco: 129,
      estoque: 18,
      teorAlcoolico: 18,
      categorias: [{ nome: 'Frutados' }],
      sabor: { nome: 'Buriti' },
      tipo: undefined,
      estrelas: 5,
      vendas: 410
    },
    {
      id: 2,
      nome: 'Licor de Baru & Especiarias',
      descricao: 'Toques de especiarias quentes e mel silvestre.',
      preco: 98,
      estoque: 32,
      teorAlcoolico: 16,
      categorias: [{ nome: 'Colecao Safra' }],
      sabor: { nome: 'Baru' },
      tipo: undefined,
      estrelas: 4.7,
      vendas: 365
    },
    {
      id: 3,
      nome: 'Colecao Mel do Cerrado',
      descricao: 'Blend autoral de meles e carvalho tostado.',
      preco: 149,
      estoque: 12,
      teorAlcoolico: 17,
      categorias: [{ nome: 'Mel' }],
      sabor: { nome: 'Mel Silvestre' },
      tipo: undefined,
      estrelas: 4.9,
      vendas: 288
    },
    {
      id: 4,
      nome: 'Licor de Pequi Assinado',
      descricao: 'Textura cremosa, especiarias doces e final fresco.',
      preco: 112,
      estoque: 20,
      teorAlcoolico: 19,
      categorias: [{ nome: 'Edicao limitada' }],
      sabor: { nome: 'Pequi' },
      tipo: undefined,
      estrelas: 4.6,
      vendas: 340
    },
    {
      id: 5,
      nome: 'Licor de Umbu & Capim Santo',
      descricao: 'Equilibrio herbal com acidez brilhante.',
      preco: 105,
      estoque: 14,
      teorAlcoolico: 15,
      categorias: [{ nome: 'Frutados' }],
      sabor: { nome: 'Umbu' },
      tipo: undefined,
      estrelas: 4.4,
      vendas: 215
    },
    {
      id: 6,
      nome: 'Licor de Cafe do Cerrado',
      descricao: 'Notas de chocolate amargo e rapadura.',
      preco: 119,
      estoque: 24,
      teorAlcoolico: 20,
      categorias: [{ nome: 'Colecao Safra' }],
      sabor: { nome: 'Cafe' },
      tipo: undefined,
      estrelas: 4.8,
      vendas: 398
    },
    {
      id: 7,
      nome: 'Kit Degustacao Raizes',
      descricao: 'Selecao com quatro mini garrafas para harmonizacao.',
      preco: 189,
      estoque: 40,
      teorAlcoolico: 17,
      categorias: [{ nome: 'Degustacao' }],
      sabor: { nome: 'Mix especial' },
      tipo: undefined,
      estrelas: 4.5,
      vendas: 520
    },
    {
      id: 8,
      nome: 'Licor de Mel do Cerrado Extra',
      descricao: 'Maturado em carvalho brasileiro por 12 meses.',
      preco: 159,
      estoque: 8,
      teorAlcoolico: 21,
      categorias: [{ nome: 'Mel' }],
      sabor: { nome: 'Mel silvestre' },
      tipo: undefined,
      estrelas: 4.9,
      vendas: 295
    }
  ];

  constructor(private produtoService: ProdutoService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  protected setCategory(category: string): void {
    this.filters.category = category;
    this.applyFilters(true);
  }

  protected applyFilters(resetPagination = false): void {
    let items = [...this.allProducts];
    const search = this.filters.search.trim().toLowerCase();

    items = items.filter(product => {
      const categories = this.getCategories(product);
      const flavor = this.getFlavor(product);
      const type = this.getType(product);
      const rating = this.getRating(product);

      const matchesSearch = !search || product.nome?.toLowerCase().includes(search);
      const matchesCategory =
        this.filters.category === 'todos' || categories.includes(this.filters.category);
      const matchesPrice =
        product.preco >= this.filters.minPrice && product.preco <= this.filters.maxPrice;
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

  protected loadMore(): void {
    this.currentPage += 1;
    this.updateVisibleProducts();
  }

  protected hasMore(): boolean {
    return this.currentPage * this.pageSize < this.filteredProducts.length;
  }

  protected trackById(_: number, product: CatalogProduct): number | undefined {
    return product.id;
  }

  protected formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  protected accentBackground(index: number): string {
    const patterns = [
      'linear-gradient(135deg, #fde68a, #f97316)',
      'linear-gradient(135deg, #d8b4fe, #a855f7)',
      'linear-gradient(135deg, #bfdbfe, #60a5fa)',
      'linear-gradient(135deg, #fcd34d, #f59e0b)',
      'linear-gradient(135deg, #fecdd3, #f472b6)'
    ];
    return patterns[index % patterns.length];
  }

  protected onPriceChange(): void {
    this.filters.minPrice = Number(this.filters.minPrice) || 0;
    this.filters.maxPrice = Number(this.filters.maxPrice) || this.filters.minPrice;
    if (this.filters.minPrice > this.filters.maxPrice) {
      this.filters.maxPrice = this.filters.minPrice;
    }
    this.applyFilters(true);
  }

  private loadProducts(): void {
    this.produtoService.getVisiveis().subscribe({
      next: products => this.initializeCatalog(products),
      error: () => this.initializeCatalog(this.sampleProducts)
    });
  }

  private initializeCatalog(data?: Licor[] | Licor | null): void {
    const dataset = (Array.isArray(data) && data.length ? data : this.sampleProducts) as CatalogProduct[];
    this.allProducts = dataset.map((product, index) => ({
      ...product,
      badge: product.badge ?? (index % 2 === 0 ? 'Colecao autoral' : 'Mais pedido'),
      vendas: product.vendas ?? (300 - index * 17)
    }));

    this.availableCategories = this.collectOptions(this.allProducts, this.getCategories.bind(this));
    this.availableFlavors = this.collectOptions(this.allProducts, item => [this.getFlavor(item)]);
    this.availableTypes = this.collectOptions(this.allProducts, item => [this.getType(item)]);

    const prices = this.allProducts.map(item => item.preco).filter(price => typeof price === 'number');
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

  protected getCategories(product: CatalogProduct): string[] {
    return (product.categorias ?? [])
      .map(categoria => categoria.nome || categoria.descricao || '')
      .filter(Boolean);
  }

  protected getFlavor(product: CatalogProduct): string {
    return product.sabor?.nome ?? 'Autorais';
  }

  protected getType(product: CatalogProduct): string {
    if (!product.tipo) {
      return 'Especial';
    }
    return product.tipo
      .toString()
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/(^|\s)\S/g, char => char.toUpperCase());
  }

  protected getRating(product: CatalogProduct): number {
    if (product.estrelas) {
      return product.estrelas;
    }
    if (product.avaliacoes && product.avaliacoes.length) {
      const total = product.avaliacoes.reduce((sum, avaliacao) => sum + (avaliacao.estrelas || 0), 0);
      return total / product.avaliacoes.length;
    }
    return 0;
  }

  protected displayRating(product: CatalogProduct): string {
    return this.getRating(product).toFixed(1);
  }

  private sortProducts(products: CatalogProduct[], sortOption: string): CatalogProduct[] {
    const sorted = [...products];
    switch (sortOption) {
      case 'precoAsc':
        return sorted.sort((a, b) => a.preco - b.preco);
      case 'precoDesc':
        return sorted.sort((a, b) => b.preco - a.preco);
      case 'nome':
        return sorted.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      case 'maisVendidos':
        return sorted.sort((a, b) => (b.vendas || 0) - (a.vendas || 0));
      default:
        return sorted;
    }
  }

  private updateVisibleProducts(): void {
    this.visibleProducts = this.filteredProducts.slice(0, this.currentPage * this.pageSize);
  }
}
