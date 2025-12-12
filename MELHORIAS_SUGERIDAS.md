# 📊 Análise do Projeto E-commerce Sabores do Cerrado

## ✅ **Pontos Fortes**

### 1. **Arquitetura e Organização**
- ✅ Estrutura bem organizada com separação clara de responsabilidades
- ✅ Uso de interceptors para autenticação e tratamento de erros
- ✅ Guards implementados para proteção de rotas
- ✅ Services bem estruturados para comunicação com API
- ✅ Componentes modulares e reutilizáveis

### 2. **Funcionalidades Implementadas**
- ✅ Sistema de autenticação completo (login, registro, perfil)
- ✅ Carrinho de compras funcional
- ✅ Sistema de avaliações e comentários
- ✅ Filtros e busca de produtos
- ✅ Área administrativa
- ✅ Integração com API Quarkus

### 3. **UX/UI**
- ✅ Interface responsiva com Bootstrap
- ✅ Feedback visual com toasts
- ✅ Design limpo e organizado

---

## ⚠️ **Pontos Críticos a Melhorar**

### 🔴 **1. SEGURANÇA (CRÍTICO)**

#### Tokens armazenados no localStorage
```typescript
// ❌ PROBLEMA: Vulnerável a XSS attacks
localStorage.setItem('token', response.token);
```

**✅ Solução Recomendada:**
- Usar **httpOnly cookies** para armazenar tokens
- Implementar **refresh tokens**
- Adicionar **CSRF protection**

#### Senha em texto plano no formulário
```typescript
// ❌ PROBLEMA: Senha visível em plain text
senha: ['', [Validators.required, Validators.minLength(6)]]
```

**✅ Solução:**
- Nunca enviar senha sem hash
- Implementar validação de força de senha
- Adicionar autenticação em duas etapas (2FA)

---

### 🟡 **2. GESTÃO DE ESTADO**

#### Problema: Estado distribuído em múltiplos componentes
```typescript
// Carrinho gerenciado localmente em cada componente
private carrinho: ItemCarrinho[] = [];
```

**✅ Solução Recomendada:**
```bash
ng add @ngrx/store
ng add @ngrx/effects
```

Implementar **NgRx** ou **Akita** para:
- Estado centralizado do carrinho
- Estado de autenticação
- Cache de produtos
- Histórico de pedidos

---

### 🟡 **3. PERFORMANCE**

#### Faltam otimizações essenciais:

```typescript
// ❌ PROBLEMA: Lista sem paginação/virtual scroll
<div *ngFor="let produto of produtos">

// ✅ SOLUÇÃO 1: Implementar paginação no backend
loadProducts(page: number, size: number) {
  return this.http.get(`${this.API_URL}/produtos?page=${page}&size=${size}`);
}

// ✅ SOLUÇÃO 2: Virtual Scrolling para listas grandes
import { ScrollingModule } from '@angular/cdk/scrolling';

<cdk-virtual-scroll-viewport itemSize="200">
  <div *cdkVirtualFor="let produto of produtos">
    ...
  </div>
</cdk-virtual-scroll-viewport>
```

#### Lazy Loading não implementado
```typescript
// ✅ SOLUÇÃO: Implementar lazy loading
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];
```

---

### 🟡 **4. CARRINHO DE COMPRAS - Melhorias Essenciais**

#### a) Persistência do Carrinho
```typescript
// ✅ Implementar serviço de persistência
@Injectable()
export class CarrinhoService {
  private carrinho$ = new BehaviorSubject<ItemCarrinho[]>(this.loadFromStorage());
  
  private loadFromStorage(): ItemCarrinho[] {
    const saved = localStorage.getItem('carrinho');
    return saved ? JSON.parse(saved) : [];
  }
  
  private saveToStorage(items: ItemCarrinho[]) {
    localStorage.setItem('carrinho', JSON.stringify(items));
  }
  
  addItem(item: ItemCarrinho) {
    const current = this.carrinho$.value;
    const updated = [...current, item];
    this.carrinho$.next(updated);
    this.saveToStorage(updated);
  }
}
```

#### b) Validação de Estoque em Tempo Real
```typescript
// ✅ Verificar disponibilidade antes de adicionar
addToCart(produto: Produto, quantidade: number) {
  this.produtoService.checkStock(produto.id, quantidade).subscribe({
    next: (available) => {
      if (available) {
        this.carrinhoService.addItem({...});
      } else {
        this.messageService.add('Estoque insuficiente');
      }
    }
  });
}
```

#### c) Cálculo de Frete
```typescript
// ✅ Integrar API de frete (Correios, Melhor Envio)
@Injectable()
export class FreteService {
  calcularFrete(cep: string, peso: number, valor: number) {
    return this.http.post('https://api.melhorenvio.com/v2/me/shipment/calculate', {
      from: { postal_code: '70000000' },
      to: { postal_code: cep },
      products: [{ weight: peso, insurance_value: valor }]
    });
  }
}
```

---

### 🟡 **5. CHECKOUT - Implementações Necessárias**

#### Processo de checkout completo:

```typescript
// ✅ Criar fluxo de checkout em etapas
export interface CheckoutState {
  step: 'cart' | 'address' | 'payment' | 'review' | 'confirmation';
  endereco?: Endereco;
  pagamento?: DadosPagamento;
  frete?: OpcaoFrete;
}

@Component({
  selector: 'app-checkout',
  template: `
    <div [ngSwitch]="currentStep">
      <app-checkout-cart *ngSwitchCase="'cart'"></app-checkout-cart>
      <app-checkout-address *ngSwitchCase="'address'"></app-checkout-address>
      <app-checkout-payment *ngSwitchCase="'payment'"></app-checkout-payment>
      <app-checkout-review *ngSwitchCase="'review'"></app-checkout-review>
      <app-checkout-confirmation *ngSwitchCase="'confirmation'"></app-checkout-confirmation>
    </div>
  `
})
export class CheckoutComponent { }
```

#### Integração com Pagamento:
```typescript
// ✅ Integrar gateway de pagamento (Stripe, PagSeguro, Mercado Pago)
@Injectable()
export class PagamentoService {
  processarPagamento(dados: DadosPagamento) {
    return this.http.post(`${this.API_URL}/pagamento/processar`, dados);
  }
  
  // Webhook para receber confirmação
  confirmarPagamento(transacaoId: string) {
    return this.http.post(`${this.API_URL}/pagamento/confirmar/${transacaoId}`);
  }
}
```

---

### 🟡 **6. TRATAMENTO DE ERROS**

#### Melhorar feedback ao usuário:

```typescript
// ✅ Criar serviço de erro centralizado
@Injectable()
export class ErrorHandlerService {
  handleError(error: HttpErrorResponse) {
    let message = 'Erro desconhecido';
    
    switch (error.status) {
      case 400:
        message = 'Dados inválidos. Verifique as informações.';
        break;
      case 401:
        message = 'Sessão expirada. Faça login novamente.';
        this.router.navigate(['/login']);
        break;
      case 403:
        message = 'Acesso negado.';
        break;
      case 404:
        message = 'Recurso não encontrado.';
        break;
      case 500:
        message = 'Erro no servidor. Tente novamente mais tarde.';
        break;
    }
    
    this.messageService.add({ severity: 'error', summary: message });
    return throwError(() => error);
  }
}
```

---

### 🟡 **7. VALIDAÇÕES E UX**

#### a) Validação de CPF/CNPJ
```typescript
// ✅ Adicionar validador customizado
export class CustomValidators {
  static cpf(control: AbstractControl): ValidationErrors | null {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) return { cpfInvalido: true };
    
    // Implementar algoritmo de validação de CPF
    // ...
    
    return null;
  }
  
  static cnpj(control: AbstractControl): ValidationErrors | null {
    const cnpj = control.value?.replace(/\D/g, '');
    if (!cnpj || cnpj.length !== 14) return { cnpjInvalido: true };
    
    // Implementar algoritmo de validação de CNPJ
    // ...
    
    return null;
  }
  
  static cep(control: AbstractControl): ValidationErrors | null {
    const cep = control.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return { cepInvalido: true };
    return null;
  }
}
```

#### b) Máscara de Inputs
```bash
npm install ngx-mask
```

```typescript
// ✅ Aplicar máscaras com formatação correta
<input mask="000.000.000-00" formControlName="cpf">
<input mask="00.000.000/0000-00" formControlName="cnpj">
<input mask="(00) 00000-0000" formControlName="telefone">
<input mask="00000-000" formControlName="cep">
```

#### c) Validação de CEP com API dos Correios
```typescript
// ✅ Buscar endereço automaticamente ao preencher CEP
@Injectable()
export class CepService {
  private readonly VIACEP_API = 'https://viacep.com.br/ws';
  
  buscarCep(cep: string): Observable<Endereco> {
    const cepLimpo = cep.replace(/\D/g, '');
    return this.http.get<Endereco>(`${this.VIACEP_API}/${cepLimpo}/json/`);
  }
}

// Componente
onCepBlur() {
  const cep = this.form.get('cep')?.value;
  if (cep?.length === 9) {
    this.cepService.buscarCep(cep).subscribe({
      next: (endereco) => {
        this.form.patchValue({
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.localidade,
          estado: endereco.uf
        });
      },
      error: () => this.messageService.add('CEP não encontrado')
    });
  }
}
```

---

### 🟡 **8. UPLOAD E VALIDAÇÃO DE IMAGENS**

#### a) Limitação de Tamanho de Imagem para Produtos
```typescript
// ✅ Validar tamanho e dimensões da imagem
@Injectable()
export class ImageValidatorService {
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_WIDTH = 2048;
  private readonly MAX_HEIGHT = 2048;
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  validateImage(file: File): Observable<{ valid: boolean; error?: string }> {
    return new Observable(observer => {
      // Validar tipo
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        observer.next({ valid: false, error: 'Formato não suportado. Use JPEG, PNG ou WebP.' });
        observer.complete();
        return;
      }
      
      // Validar tamanho
      if (file.size > this.MAX_SIZE) {
        observer.next({ valid: false, error: 'Imagem muito grande. Máximo: 5MB.' });
        observer.complete();
        return;
      }
      
      // Validar dimensões
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        if (img.width > this.MAX_WIDTH || img.height > this.MAX_HEIGHT) {
          observer.next({ 
            valid: false, 
            error: `Dimensões muito grandes. Máximo: ${this.MAX_WIDTH}x${this.MAX_HEIGHT}px` 
          });
        } else {
          observer.next({ valid: true });
        }
        observer.complete();
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        observer.next({ valid: false, error: 'Erro ao carregar imagem.' });
        observer.complete();
      };
      
      img.src = url;
    });
  }
  
  compressImage(file: File, maxWidth: number = 1024): Observable<Blob> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * ratio;
          
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            observer.next(blob!);
            observer.complete();
          }, 'image/jpeg', 0.9);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}

// Componente de Upload
onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  this.imageValidator.validateImage(file).subscribe({
    next: (result) => {
      if (!result.valid) {
        this.messageService.add({ severity: 'error', summary: result.error });
        return;
      }
      
      // Comprimir imagem antes de upload
      this.imageValidator.compressImage(file).subscribe({
        next: (compressedBlob) => {
          const formData = new FormData();
          formData.append('file', compressedBlob, file.name);
          this.uploadService.upload(formData).subscribe();
        }
      });
    }
  });
}
```

#### b) Limitação de Caracteres em Campos
```typescript
// ✅ Validadores de tamanho
export class CustomValidators {
  static maxLength(max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.toString() || '';
      return value.length > max ? { maxLength: { max, actual: value.length } } : null;
    };
  }
  
  static minLength(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.toString() || '';
      return value.length < min ? { minLength: { min, actual: value.length } } : null;
    };
  }
}

// Aplicar no formulário
this.produtoForm = this.fb.group({
  nome: ['', [Validators.required, Validators.maxLength(100)]],
  descricao: ['', [Validators.required, Validators.maxLength(500)]],
  descricaoDetalhada: ['', [Validators.maxLength(2000)]],
  preco: ['', [Validators.required, Validators.min(0.01)]],
  estoque: ['', [Validators.required, Validators.min(0)]]
});
```

```html
<!-- ✅ Contador de caracteres -->
<mat-form-field>
  <mat-label>Descrição do Produto</mat-label>
  <textarea 
    matInput 
    formControlName="descricao" 
    maxlength="500"
    rows="4"></textarea>
  <mat-hint align="end">
    {{ form.get('descricao')?.value?.length || 0 }} / 500
  </mat-hint>
  <mat-error *ngIf="form.get('descricao')?.hasError('maxlength')">
    Máximo de 500 caracteres
  </mat-error>
</mat-form-field>
```

---

### 🟡 **9. SEO E ACESSIBILIDADE**

#### a) Meta Tags Dinâmicas
```typescript
// ✅ Implementar SEO
import { Meta, Title } from '@angular/platform-browser';

export class ProductDetailComponent {
  constructor(
    private meta: Meta,
    private title: Title
  ) {}
  
  ngOnInit() {
    this.title.setTitle(`${this.produto.nome} - Sabores do Cerrado`);
    this.meta.updateTag({ name: 'description', content: this.produto.descricao });
    this.meta.updateTag({ property: 'og:image', content: this.produto.imagemUrl });
  }
}
```

#### b) Acessibilidade (WCAG 2.1)
```html
<!-- ✅ Adicionar ARIA labels -->
<button aria-label="Adicionar ao carrinho" (click)="addToCart()">
  <i class="bi bi-cart-plus"></i>
</button>

<img [src]="produto.imagemUrl" [alt]="produto.nome + ' - ' + produto.descricao">
```

---

### 🟡 **10. BOAS PRÁTICAS ANGULAR**

#### a) Uso Correto de Observables
```typescript
// ❌ ERRO COMUM: Não usar unsubscribe
export class ProductListComponent implements OnInit {
  ngOnInit() {
    this.produtoService.getAll().subscribe(data => this.produtos = data);
    // Memory leak - subscription não é cancelada
  }
}

// ✅ SOLUÇÃO 1: Usar async pipe (recomendado)
export class ProductListComponent {
  produtos$: Observable<Produto[]>;
  
  constructor(private produtoService: ProdutoService) {
    this.produtos$ = this.produtoService.getAll();
  }
}
// Template: <div *ngFor="let produto of produtos$ | async">

// ✅ SOLUÇÃO 2: Usar takeUntil
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  produtos: Produto[] = [];
  
  ngOnInit() {
    this.produtoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.produtos = data);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ✅ SOLUÇÃO 3: Usar Signals (Angular 16+)
export class ProductListComponent {
  produtos = signal<Produto[]>([]);
  
  constructor(private produtoService: ProdutoService) {
    this.produtoService.getAll().subscribe(data => this.produtos.set(data));
  }
}
// Template: <div *ngFor="let produto of produtos()">
```

#### b) Implementação Correta de OnInit
```typescript
// ❌ ERRO: Lógica no constructor
export class ProductDetailComponent {
  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService
  ) {
    // ❌ Evitar lógica pesada no constructor
    this.loadProduct();
  }
}

// ✅ CORRETO: Usar OnInit
export class ProductDetailComponent implements OnInit {
  produto = signal<Produto | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService
  ) {
    // ✅ Constructor apenas para injeção de dependências
  }
  
  ngOnInit(): void {
    // ✅ Lógica de inicialização aqui
    this.loadProduct();
  }
  
  private loadProduct(): void {
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error.set('ID do produto não fornecido');
      this.loading.set(false);
      return;
    }
    
    this.produtoService.getById(+id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.produto.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erro ao carregar produto');
          this.loading.set(false);
        }
      });
  }
}
```

#### c) Uso de Signals (Angular 16+)
```typescript
// ✅ Signals para reatividade simplificada
export class CarrinhoComponent {
  // Signals
  items = signal<ItemCarrinho[]>([]);
  total = computed(() => 
    this.items().reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
  );
  itemCount = computed(() => 
    this.items().reduce((sum, item) => sum + item.quantidade, 0)
  );
  
  // Effects
  constructor() {
    effect(() => {
      // Executado automaticamente quando items mudar
      console.log('Carrinho atualizado:', this.items().length, 'itens');
      localStorage.setItem('carrinho', JSON.stringify(this.items()));
    });
  }
  
  addItem(produto: Produto) {
    const current = this.items();
    const existing = current.find(i => i.produtoId === produto.id);
    
    if (existing) {
      this.items.update(items => 
        items.map(i => 
          i.produtoId === produto.id 
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      );
    } else {
      this.items.update(items => [...items, {
        produtoId: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: 1
      }]);
    }
  }
  
  removeItem(produtoId: number) {
    this.items.update(items => items.filter(i => i.produtoId !== produtoId));
  }
}
```

```html
<!-- Template com signals -->
<div class="carrinho">
  <h2>Carrinho ({{ itemCount() }} itens)</h2>
  
  <div *ngFor="let item of items()">
    <span>{{ item.nome }}</span>
    <span>R$ {{ item.preco | number:'1.2-2' }}</span>
    <button (click)="removeItem(item.produtoId)">Remover</button>
  </div>
  
  <div class="total">
    <strong>Total: R$ {{ total() | number:'1.2-2' }}</strong>
  </div>
</div>
```

#### d) Interpolação vs Property Binding
```html
<!-- ❌ EVITAR: Interpolação para propriedades -->
<img src="{{ produto.imagemUrl }}">
<button disabled="{{ isDisabled }}">

<!-- ✅ CORRETO: Property binding -->
<img [src]="produto.imagemUrl" [alt]="produto.nome">
<button [disabled]="isDisabled">Comprar</button>

<!-- ✅ Interpolação para texto -->
<h1>{{ produto.nome }}</h1>
<p>{{ produto.descricao }}</p>

<!-- ✅ Combinação quando necessário -->
<div class="card produto-{{ produto.id }}">
  <a [routerLink]="['/produto', produto.id]">
    {{ produto.nome }}
  </a>
</div>
```

#### e) Uso de ResolveFn para Carregamento de Dados
```typescript
// ✅ Resolver para carregar dados antes da rota
export const produtoResolver: ResolveFn<Produto> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  produtoService: ProdutoService = inject(ProdutoService)
) => {
  const id = route.paramMap.get('id');
  if (!id) {
    return EMPTY;
  }
  
  return produtoService.getById(+id).pipe(
    catchError(() => {
      inject(Router).navigate(['/produtos']);
      return EMPTY;
    })
  );
};

// Configurar na rota
export const routes: Routes = [
  {
    path: 'produto/:id',
    component: ProductDetailComponent,
    resolve: { produto: produtoResolver }
  }
];

// Usar no componente
export class ProductDetailComponent implements OnInit {
  produto = signal<Produto | null>(null);
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit() {
    // Dados já carregados pelo resolver
    this.route.data.subscribe(({ produto }) => {
      this.produto.set(produto);
    });
  }
}
```

#### f) Paginação com Contador de Itens
```typescript
// ✅ Serviço de paginação
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable()
export class ProdutoService {
  getPaginated(page: number, size: number): Observable<PaginatedResponse<Produto>> {
    return this.http.get<PaginatedResponse<Produto>>(
      `${this.API_URL}/produtos?page=${page}&size=${size}`
    );
  }
}

// ✅ Componente com paginação
export class ProductListComponent implements OnInit {
  produtos = signal<Produto[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(12);
  
  // Computed para informações de paginação
  startItem = computed(() => (this.currentPage() * this.pageSize()) + 1);
  endItem = computed(() => 
    Math.min((this.currentPage() + 1) * this.pageSize(), this.totalElements())
  );
  
  ngOnInit() {
    this.loadProducts();
  }
  
  loadProducts() {
    this.produtoService
      .getPaginated(this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          this.produtos.set(response.content);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);
        }
      });
  }
  
  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadProducts();
  }
}
```

```html
<!-- Template com contador e paginação -->
<div class="products-header">
  <p class="item-count">
    Exibindo {{ startItem() }} - {{ endItem() }} de {{ totalElements() }} produtos
  </p>
  
  <select (change)="onPageSizeChange($event.target.value)">
    <option value="12">12 por página</option>
    <option value="24">24 por página</option>
    <option value="48">48 por página</option>
  </select>
</div>

<div class="product-grid">
  <div *ngFor="let produto of produtos()">
    <!-- card do produto -->
  </div>
</div>

<mat-paginator
  [length]="totalElements()"
  [pageSize]="pageSize()"
  [pageIndex]="currentPage()"
  [pageSizeOptions]="[12, 24, 48]"
  (page)="onPageChange($event.pageIndex)"
  showFirstLastButtons>
</mat-paginator>
```

---

### 🟡 **11. TESTES**

#### Implementar testes unitários e E2E:

```typescript
// ✅ Testes unitários
describe('CarrinhoService', () => {
  it('deve adicionar item ao carrinho', () => {
    service.addItem(mockItem);
    expect(service.getItems().length).toBe(1);
  });
  
  it('deve calcular total corretamente', () => {
    service.addItem(mockItem);
    expect(service.getTotal()).toBe(100);
  });
});

// ✅ Testes E2E com Cypress
describe('Fluxo de Compra', () => {
  it('deve completar uma compra', () => {
    cy.visit('/');
    cy.contains('Licor de Pequi').click();
    cy.contains('Adicionar ao Carrinho').click();
    cy.visit('/carrinho');
    cy.contains('Finalizar Compra').click();
    // ...
  });
});
```

---

### 🟡 **12. ANALYTICS E MONITORAMENTO**

```typescript
// ✅ Integrar Google Analytics 4
import { GoogleAnalyticsService } from 'ngx-google-analytics';

export class ProductDetailComponent {
  constructor(private ga: GoogleAnalyticsService) {}
  
  addToCart(produto: Produto) {
    this.ga.event('add_to_cart', {
      currency: 'BRL',
      value: produto.preco,
      items: [{
        item_id: produto.id,
        item_name: produto.nome
      }]
    });
  }
}
```

---

## 📋 **Checklist de Implementação Prioritária**

### 🔴 **Alta Prioridade (1-2 semanas)**
- [ ] Implementar httpOnly cookies para tokens
- [ ] Adicionar validação de estoque em tempo real
- [ ] Implementar processo de checkout completo
- [ ] Integrar gateway de pagamento
- [ ] Adicionar cálculo de frete
- [ ] Implementar persistência do carrinho
- [ ] Melhorar tratamento de erros
- [ ] Adicionar validação de tamanho de imagem (máx 5MB, 2048x2048px)
- [ ] Implementar compressão automática de imagens
- [ ] Adicionar limitação de caracteres em todos os campos de texto
- [ ] Implementar formatação automática de CEP com busca na API ViaCEP
- [ ] Adicionar máscaras para CPF, CNPJ e telefone

### 🟡 **Média Prioridade (2-4 semanas)**
- [ ] Implementar NgRx para gestão de estado
- [ ] Adicionar paginação com contador de itens (ex: "Exibindo 1-12 de 150 produtos")
- [ ] Implementar lazy loading de módulos
- [ ] Implementar sistema de cupons de desconto
- [ ] Adicionar histórico de pedidos
- [ ] Implementar sistema de notificações
- [ ] Migrar para Signals em todos os componentes
- [ ] Implementar ResolveFn para pré-carregamento de dados
- [ ] Refatorar para usar async pipe e evitar memory leaks
- [ ] Substituir constructor logic por OnInit
- [ ] Padronizar uso de property binding ao invés de interpolação para propriedades
- [ ] Adicionar contadores de caracteres em todos os campos de texto

### 🟢 **Baixa Prioridade (1-2 meses)**
- [ ] Implementar PWA (Progressive Web App)
- [ ] Adicionar testes unitários e E2E
- [ ] Implementar SSR (Server-Side Rendering)
- [ ] Adicionar Google Analytics
- [ ] Implementar SEO avançado
- [ ] Adicionar internacionalização (i18n)
- [ ] Implementar sistema de recomendações

---

## 💡 **Recursos Adicionais Sugeridos**

1. **Sistema de Favoritos/Wishlist**
2. **Comparador de Produtos**
3. **Sistema de Cupons e Promoções**
4. **Programa de Fidelidade/Pontos**
5. **Chat de Suporte (ex: Tawk.to)**
6. **Sistema de Avaliações com Fotos**
7. **Notificações Push**
8. **Integração com Redes Sociais (compartilhar produtos)**
9. **Sistema de Rastreamento de Pedidos**
10. **Área de Produtos Relacionados/Cross-sell**

---

## 🎯 **Conclusão**

O projeto está bem estruturado e funcional, mas precisa de melhorias críticas em **segurança** e **funcionalidades de e-commerce** para ser considerado production-ready. Priorize as implementações na ordem sugerida para ter um e-commerce completo e seguro.

**Nota Final: 7.5/10** - Boa base, mas precisa de refinamentos para ambiente de produção.

---

## 📚 **Recursos e Documentação**

### Segurança
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security Guide](https://angular.io/guide/security)

### Gestão de Estado
- [NgRx Documentation](https://ngrx.io/)
- [Akita Documentation](https://opensource.salesforce.com/akita/)

### Performance
- [Angular Performance Checklist](https://github.com/mgechev/angular-performance-checklist)
- [Web.dev Performance](https://web.dev/performance/)

### E-commerce Best Practices
- [E-commerce UX Guidelines](https://baymard.com/ecommerce-design-guidelines)
- [Shopify UX Patterns](https://ux.shopify.com/)

### Pagamentos
- [Stripe Documentation](https://stripe.com/docs)
- [PagSeguro API](https://dev.pagseguro.uol.com.br/)
- [Mercado Pago Developers](https://www.mercadopago.com.br/developers/)

### Testes
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Cypress Documentation](https://docs.cypress.io/)
