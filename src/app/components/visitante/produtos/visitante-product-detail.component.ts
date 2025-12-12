import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Licor, Avaliacao } from '@models/licor.model';
import { ProdutoService } from '@services/produto.service';
import { AvaliacaoService } from '@services/avaliacao.service';
import { AuthService } from '@services/auth.service';
import { fallbackImage } from '../shared/image-fallbacks';

@Component({
  selector: 'app-visitante-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './visitante-product-detail.component.html',
  styleUrl: './visitante-product-detail.component.css'
})
export class VisitanteProductDetailComponent implements OnInit, OnDestroy {
  isLoading = true;
  loadError = '';
  product?: Licor;
  heroImage = '';
  currentProductId?: string;
  galleryImages: string[] = [];
  ratingInput = 5;
  comentarioInput = '';
  avaliacaoMessage = '';
  avaliacaoError = '';
  avaliando = false;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly produtoService: ProdutoService,
    private readonly avaliacaoService: AvaliacaoService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const sub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.currentProductId = id ?? undefined;
      if (!id) {
        this.isLoading = false;
        this.loadError = 'Produto não encontrado. Confira o ID informado na rota.';
        this.product = undefined;
        return;
      }

      this.buscarProduto(id);
    });

    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  retry(): void {
    if (this.currentProductId) {
      this.buscarProduto(this.currentProductId);
    }
  }

  formatCurrency(value?: number): string {
    if (typeof value !== 'number') {
      return 'Sob consulta';
    }

    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  ratingDisplay(product: Licor): string {
    const rating = this.getRating(product);
    return rating ? rating.toFixed(1) : 'Sem avaliacoes';
  }

  categoryLabels(product: Licor): string[] {
    return (product.categorias ?? [])
      .map(categoria => categoria.nome || categoria.descricao || '')
      .filter(Boolean);
  }

  ingredientes(product: Licor): string[] {
    return (product.ingredientes ?? []).map(ingrediente => {
      if (ingrediente.quantidade && ingrediente.unidadeMedida) {
        return `${ingrediente.nome} (${ingrediente.quantidade}${ingrediente.unidadeMedida})`;
      }
      return ingrediente.nome;
    });
  }

  premiacoes(product: Licor): string[] {
    return (product.premiacoes ?? []).map(
      premiacao => `${premiacao.evento} - ${premiacao.ano} (${premiacao.medalha})`
    );
  }

  hasAvaliacoes(product: Licor): boolean {
    return !!(product.avaliacoes && product.avaliacoes.length);
  }

  parceiro(product: Licor): string {
    const parceiro = product.parceiroComercial;
    if (!parceiro) {
      return 'Defina o parceiro comercial para exibir aqui.';
    }

    const cidade = parceiro.enderecos?.[0]?.cidade?.nome;
    const nome =
      parceiro.nomeFantasia || parceiro.razaoSocial || parceiro.cnpj || parceiro.email || 'Parceiro';

    return cidade ? `${nome} - ${cidade}` : nome;
  }

  private buscarProduto(id: string): void {
    this.isLoading = true;
    this.loadError = '';

    const sub = this.produtoService.buscarPorId(id).subscribe({
      next: produto => {
        this.product = produto;
        this.heroImage = this.resolveImage(produto, 0);
        this.galleryImages = this.composeGallery(produto);
        this.isLoading = false;
      },
      error: () => {
        this.product = undefined;
        this.isLoading = false;
        this.loadError =
          'Não conseguimos carregar os dados desse produto. Verifique o endpoint /licor/{id}.';
      }
    });

    this.subscriptions.add(sub);
  }

  private resolveImage(produto: Licor, index: number): string {
    if (produto.imagem) {
      if (index === 0) return produto.imagem;
    }
    if (produto.imagens && produto.imagens.length > index) {
      return produto.imagens[index];
    }
    return fallbackImage(index);
  }

  private composeGallery(produto: Licor): string[] {
    if (produto.imagens && produto.imagens.length) {
      return produto.imagens;
    }
    if (produto.imagem) {
      return [produto.imagem];
    }
    return [fallbackImage(0), fallbackImage(1), fallbackImage(2)];
  }

  private getRating(product: Licor): number {
    if (product.estrelas) {
      return product.estrelas;
    }

    if (!product.avaliacoes || !product.avaliacoes.length) {
      return 0;
    }

    const total = product.avaliacoes.reduce(
      (sum, avaliacao) => sum + (avaliacao.estrelas || 0),
      0
    );
    return total / product.avaliacoes.length;
  }

  canEvaluate(): boolean {
    return this.authService.isAuthenticated();
  }

  enviarAvaliacao(): void {
    if (!this.product?.id) return;
    if (!this.canEvaluate()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/produtos/${this.product.id}` } });
      return;
    }
    if (!this.ratingInput) {
      this.avaliacaoError = 'Escolha uma nota de 1 a 5.';
      return;
    }

    this.avaliacaoMessage = '';
    this.avaliacaoError = '';
    this.avaliando = true;

    this.avaliacaoService
      .criar({
        licorId: this.product.id,
        estrelas: this.ratingInput,
        comentario: this.comentarioInput || undefined
      })
      .subscribe({
        next: (avaliacao: Avaliacao) => {
          this.avaliando = false;
          this.avaliacaoMessage = 'Avaliação registrada com sucesso.';
          this.product = {
            ...this.product!,
            avaliacoes: [...(this.product?.avaliacoes || []), avaliacao]
          };
          this.comentarioInput = '';
        },
        error: (err: any) => {
          this.avaliando = false;
          if (err?.status === 401) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: `/produtos/${this.product?.id}` } });
            return;
          }
          this.avaliacaoError =
            err?.error?.message || err?.friendlyMessage || err?.message || 'Não foi possível enviar a avaliação.';
        }
      });
  }
}
