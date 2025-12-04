import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FeaturedProduct {
  title: string;
  description: string;
  tag: string;
  image: string;
  rating: number;
  price: string;
}

interface CategoryCard {
  label: string;
  description: string;
  image: string;
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './visitante-home.component.html',
  styleUrl: './visitante-home.component.css'
})
export class VisitanteHomeComponent implements OnInit, OnDestroy {
  protected activeSlide = signal(0);
  protected readonly featuredProducts: FeaturedProduct[] = [
    {
      title: 'Licor de Buriti Safra Especial',
      description: 'Notas tropicais, textura macia e final citrico.',
      tag: 'Safra limitada',
      image: 'assets/landing/buriti.png',
      rating: 5,
      price: 'R$ 129'
    },
    {
      title: 'Licor de Baru & Especiarias',
      description: 'Combina textura amanteigada e especiarias aquecidas.',
      tag: 'Favorito dos clientes',
      image: 'assets/landing/baru.png',
      rating: 4.8,
      price: 'R$ 98'
    },
    {
      title: 'Colecao Mel do Cerrado',
      description: 'Blend exclusivo com mel silvestre e carvalho tostado.',
      tag: 'Novo lote',
      image: 'assets/landing/mel.png',
      rating: 4.9,
      price: 'R$ 149'
    }
  ];

  protected readonly categories: CategoryCard[] = [
    {
      label: 'Colecao Safra',
      description: 'Rotulos numerados de colheitas raras.',
      image: 'assets/landing/safra.jpg',
      color: '#feedda'
    },
    {
      label: 'Frutados',
      description: 'Buriti, pequi e frutos do Cerrado.',
      image: 'assets/landing/frutados.jpg',
      color: '#ffe9ef'
    },
    {
      label: 'Mel & Florais',
      description: 'Texturas doces com final elegante.',
      image: 'assets/landing/mel-floral.jpg',
      color: '#eaf6ff'
    },
    {
      label: 'Edicoes limitadas',
      description: 'Parcerias com chefs e mixologistas.',
      image: 'assets/landing/limitada.jpg',
      color: '#f0f3fb'
    }
  ];

  protected readonly testimonials: Testimonial[] = [
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

  protected readonly metrics = [
    { value: '10+', label: 'anos de pesquisa' },
    { value: '25', label: 'produtores parceiros' },
    { value: '40k', label: 'garrafas por ano' },
    { value: '4.9', label: 'avaliacao media' }
  ];

  protected newsletterEmail = '';
  protected newsletterFeedback = '';
  private slideInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  nextSlide(): void {
    this.activeSlide.update(index => (index + 1) % this.featuredProducts.length);
  }

  prevSlide(): void {
    this.activeSlide.update(index =>
      index === 0 ? this.featuredProducts.length - 1 : index - 1
    );
  }

  goToSlide(index: number): void {
    this.activeSlide.set(index);
    this.restartCarousel();
  }

  subscribeNewsletter(): void {
    if (!this.newsletterEmail.trim()) {
      this.newsletterFeedback = 'Informe um e-mail valido para receber novidades.';
      return;
    }

    this.newsletterFeedback = 'Obrigado! Voce recebera nossas novidades em breve.';
    this.newsletterEmail = '';
  }

  protected formatRating(value: number): string {
    return value.toFixed(1).replace('.0', '');
  }

  private startCarousel(): void {
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
}
