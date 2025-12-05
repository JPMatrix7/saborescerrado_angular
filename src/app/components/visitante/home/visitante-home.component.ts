import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Categoria } from '../../../models/categoria.model';
import { Licor } from '../../../models/licor.model';
import { CategoriaService } from '../../../services/categoria.service';
import { ProdutoService } from '../../../services/produto.service';
import { fallbackImage } from '../shared/image-fallbacks';

interface FeaturedProduct {
  id?: number;
  title: string;
  description: string;
  tag: string;
  image: string;
  rating: number;
}

interface CategoryCard {
  id?: number;
  label: string;
  description: string;
  color: string;
}

interface Testimonial {
  name: string;
  city: string;
  comment: string;
  rating: number;
}

@Component({
  selector: 'app-visitante-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './visitante-home.component.html',
  styleUrl: './visitante-home.component.css'
})
export class VisitanteHomeComponent implements OnInit, OnDestroy {
  readonly activeSlide = signal(0);
  featuredProducts: FeaturedProduct[] = [];
  categories: CategoryCard[] = [];

  readonly testimonials: Testimonial[] = [
    {
      name: 'Marina Figueiredo',
      city: 'Brasilia - DF',
      comment: 'A textura e o aroma do licor de buriti sao inesqueciveis. Entrega impecavel!',
      rating: 5
    },
    {
      name: 'Diego Amaral',
      city: 'Goiania - GO',
      comment: 'Perfeito para presentear clientes. A embalagem e o sabor impressionam.',
      rating: 5
    },
    {
      name: 'Luiza Cabral',
      city: 'Belo Horizonte - MG',
      comment: 'O kit degustacao trouxe a experiencia do Cerrado para minha casa.',
      rating: 4.5
    }
  ];

  readonly metrics = [
    { value: '10+', label: 'anos de pesquisa' },
    { value: '25', label: 'produtores parceiros' },
    { value: '40k', label: 'garrafas por ano' },
    { value: '4.9', label: 'avaliacao media' }
  ];

  private slideInterval?: ReturnType<typeof setInterval>;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly produtoService: ProdutoService,
    private readonly categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.carregarProdutosEmDestaque();
    this.carregarCategorias();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
    this.subscriptions.unsubscribe();
  }

  nextSlide(): void {
    if (!this.featuredProducts.length) {
      return;
    }

    this.activeSlide.update(index => (index + 1) % this.featuredProducts.length);
  }

  prevSlide(): void {
    if (!this.featuredProducts.length) {
      return;
    }

    this.activeSlide.update(index =>
      index === 0 ? this.featuredProducts.length - 1 : index - 1
    );
  }

  goToSlide(index: number): void {
    if (!this.featuredProducts.length) {
      return;
    }

    this.activeSlide.set(index);
    this.restartCarousel();
  }

  formatRating(value: number): string {
    return value ? value.toFixed(1).replace('.0', '') : '0';
  }

  private startCarousel(): void {
    if (this.featuredProducts.length < 2) {
      return;
    }

    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  private stopCarousel(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  private restartCarousel(): void {
    this.stopCarousel();
    this.startCarousel();
  }

  private carregarProdutosEmDestaque(): void {
    const subscription = this.produtoService.getVisiveis().subscribe({
      next: licores => {
        this.featuredProducts = licores.map((licor, index) => this.mapLicorParaCard(licor, index));
        this.activeSlide.set(0);
        this.restartCarousel();
      },
      error: () => {
        this.featuredProducts = [];
        this.stopCarousel();
      }
    });

    this.subscriptions.add(subscription);
  }

  private carregarCategorias(): void {
    const subscription = this.categoriaService.findAll().subscribe({
      next: categorias => {
        this.categories = categorias.map((categoria, index) =>
          this.mapCategoriaParaCard(categoria, index)
        );
      },
      error: () => {
        this.categories = [];
      }
    });

    this.subscriptions.add(subscription);
  }

  private mapLicorParaCard(licor: Licor, index: number): FeaturedProduct {
    return {
      id: licor.id,
      title: licor.nome,
      description: licor.descricao ?? 'Descricao indisponivel no momento.',
      tag: licor.categorias && licor.categorias.length ? licor.categorias[0].nome : 'Licor artesanal',
      image: licor.imagens && licor.imagens.length ? licor.imagens[0] : fallbackImage(index),
      rating: licor.estrelas ?? this.calcularNotaMedia(licor)
    };
  }

  private calcularNotaMedia(licor: Licor): number {
    if (!licor.avaliacoes?.length) {
      return 0;
    }

    const soma = licor.avaliacoes.reduce((total, avaliacao) => total + (avaliacao.estrelas ?? 0), 0);
    return soma / licor.avaliacoes.length;
  }

  private mapCategoriaParaCard(categoria: Categoria, index: number): CategoryCard {
    const palette = ['#feedda', '#ffe9ef', '#eaf6ff', '#f0f3fb'];

    return {
      id: categoria.id,
      label: categoria.nome,
      description: categoria.descricao ?? 'Atualize a categoria para descrever o publico.',
      color: palette[index % palette.length]
    };
  }
}
