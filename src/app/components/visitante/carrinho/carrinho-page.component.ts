import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarrinhoItem } from '@models/carrinho.model';
import { FormaPagamento } from '@models/enums.model';
import { Endereco } from '@models/endereco.model';
import { Telefone } from '@models/telefone.model';
import { AuthService } from '@services/auth.service';
import { CarrinhoService } from '@services/carrinho.service';
import { PedidoService } from '@services/pedido.service';
import { UsuarioService } from '@services/usuario.service';
import { EnderecoService } from '@services/endereco.service';
import { TelefoneService } from '@services/telefone.service';
import { CompraPayload } from '@models/compra.model';

@Component({
  selector: 'app-carrinho-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrinho-page.component.html',
  styleUrl: './carrinho-page.component.css'
})
export class CarrinhoPageComponent implements OnInit, OnDestroy {
  private readonly pendingCheckoutKey = 'pending_checkout';

  pagamento: FormaPagamento = FormaPagamento.CARTAO;
  isCheckoutLoading = false;
  checkoutMessage = '';
  checkoutError = '';
  FormaPagamento = FormaPagamento;
  chavePix = '';
  linhaDigitavelBoleto = '';
  ultimosDigitosCartao = '';
  nomeTitularCartao = '';
  bandeiraCartao = '';
  selectedEnderecoId: number | null = null;
  selectedTelefoneId: number | null = null;
  enderecos = signal<Endereco[]>([]);
  telefones = signal<Telefone[]>([]);
  isLoadingDados = signal<boolean>(false);

  items = signal<CarrinhoItem[]>([]);
  total = computed(() =>
    this.items().reduce((sum, item) => sum + this.itemPrice(item) * item.quantidade, 0)
  );

  constructor(
    private carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private enderecoService: EnderecoService,
    private telefoneService: TelefoneService,
    private router: Router,
    private http: HttpClient
  ) {
    this.carrinhoService.items$.subscribe(items => this.items.set(items));
  }

  ngOnInit(): void {
    this.carrinhoService.fetchCarrinho().subscribe({ error: () => {} });
    if (this.authService.isAuthenticated()) {
      this.loadDadosCliente();
    }
    this.resumePendingCheckout();
  }

  ngOnDestroy(): void {
    // Não limpar automaticamente, apenas garantir que o estado está consistente
    console.log('Componente de carrinho destruído');
  }

  formatCurrency(value?: number): string {
    if (typeof value !== 'number') return '--';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  updateQty(item: CarrinhoItem, qty: number): void {
    const normalized = Math.max(1, qty || 1);
    if (!item.licor.id) return;
    this.carrinhoService.updateQuantity(item.licor.id, normalized);
  }

  remove(item: CarrinhoItem): void {
    const identifier = item.id ?? item.licor.id;
    if (!identifier) return;
    this.carrinhoService.remove(identifier);
  }

  checkout(): void {
    if (!this.authService.isAuthenticated()) {
      this.storePendingCheckout();
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/carrinho' } });
      return;
    }

    if (!this.items().length) return;
    if (!this.pagamento) {
      this.checkoutError = 'Escolha uma forma de pagamento.';
      return;
    }
    if (!this.selectedEnderecoId) {
      this.checkoutError = 'Selecione um endereço para entrega.';
      return;
    }
    if (!this.selectedTelefoneId) {
      this.checkoutError = 'Selecione um telefone para contato.';
      return;
    }

    const itens = this.items()
      .filter(item => item.licor.id)
      .map(item => ({
        licorId: item.licor.id!,
        quantidade: item.quantidade,
        precoUnitario: this.itemPrice(item)
      }));

    if (!itens.length) {
      this.checkoutError = 'Adicione itens com estoque disponivel.';
      return;
    }

    const pagamentoPayload = this.buildPagamentoPayload();
    if (!pagamentoPayload) {
      return;
    }

    this.isCheckoutLoading = true;
    this.checkoutMessage = '';
    this.checkoutError = '';

    const payload: CompraPayload = {
      enderecoId: this.selectedEnderecoId,
      telefoneId: this.selectedTelefoneId,
      formaPagamento: this.pagamento,
      itens,
      ...pagamentoPayload
    };

    this.pedidoService
      .incluir(payload)
      .subscribe({
        next: (response) => {
          console.log('Compra criada com sucesso:', response);
          this.isCheckoutLoading = false;
          this.checkoutMessage = 'Compra criada com sucesso! Redirecionando...';
          
          // Limpar dados pendentes
          this.clearPendingCheckout();
          
          // Limpar carrinho completamente (localStorage + backend)
          this.carrinhoService.clear();
          this.carrinhoService.clearLocalStorage();
          
          // Resetar formulário
          this.resetForm();
          
          // Redirecionar para meus pedidos após pequeno delay
          setTimeout(() => {
            this.router.navigate(['/meus-pedidos'], { 
              state: { 
                novoPedido: true,
                mensagem: 'Seu pedido foi criado com sucesso e está com status PENDENTE. Aguarde a confirmação do administrador.' 
              }
            });
          }, 1500);
        },
        error: (err: HttpErrorResponse & { friendlyMessage?: string }) => {
          this.isCheckoutLoading = false;
          if (err.status === 401) {
            this.storePendingCheckout();
            this.redirectToLogin(err);
            return;
          }
          this.checkoutError =
            err.error?.message || err.friendlyMessage || err.message || 'Erro ao criar compra.';
        }
      });
  }

  continueShopping(): void {
    this.router.navigate(['/produtos']);
  }

  onPaymentChange(): void {
    this.chavePix = '';
    this.linhaDigitavelBoleto = '';
    this.ultimosDigitosCartao = '';
    this.nomeTitularCartao = '';
    this.bandeiraCartao = '';
  }

  private resetForm(): void {
    // Resetar campos do formulário
    this.pagamento = FormaPagamento.CARTAO;
    this.chavePix = '';
    this.linhaDigitavelBoleto = '';
    this.ultimosDigitosCartao = '';
    this.nomeTitularCartao = '';
    this.bandeiraCartao = '';
    this.selectedEnderecoId = null;
    this.selectedTelefoneId = null;
    this.checkoutError = '';
    this.checkoutMessage = '';
  }

  private itemPrice(item: CarrinhoItem): number {
    return item.precoUnitario ?? item.licor.preco ?? 0;
  }

  private redirectToLogin(error?: HttpErrorResponse): void {
    const locationHeader = error?.headers?.get('Location') || error?.headers?.get('location');
    const returnHeader =
      error?.headers?.get('X-Return-Url') || error?.headers?.get('x-return-url');
    const returnUrl = returnHeader || this.extractReturnUrl(locationHeader) || '/carrinho';

    this.router.navigate(['/login'], {
      queryParams: { returnUrl }
    });
  }

  private extractReturnUrl(locationHeader?: string | null): string | null {
    if (!locationHeader) return null;
    try {
      const parsed = new URL(locationHeader, window.location.origin);
      return parsed.searchParams.get('returnUrl') || parsed.pathname;
    } catch {
      return null;
    }
  }

  private storePendingCheckout(): void {
    const payload = {
      pagamento: this.pagamento,
      enderecoId: this.selectedEnderecoId,
      telefoneId: this.selectedTelefoneId,
      chavePix: this.chavePix,
      linhaDigitavelBoleto: this.linhaDigitavelBoleto,
      ultimosDigitosCartao: this.ultimosDigitosCartao,
      nomeTitularCartao: this.nomeTitularCartao,
      bandeiraCartao: this.bandeiraCartao
    };
    sessionStorage.setItem(this.pendingCheckoutKey, JSON.stringify(payload));
  }

  private clearPendingCheckout(): void {
    sessionStorage.removeItem(this.pendingCheckoutKey);
  }

  private resumePendingCheckout(): void {
    const raw = sessionStorage.getItem(this.pendingCheckoutKey);
    if (!raw || !this.authService.isAuthenticated()) return;

    this.clearPendingCheckout();
    try {
      const parsed = JSON.parse(raw) as Partial<{
        pagamento: FormaPagamento;
        enderecoId: number;
        telefoneId: number;
        chavePix: string;
        linhaDigitavelBoleto: string;
        ultimosDigitosCartao: string;
        nomeTitularCartao: string;
        bandeiraCartao: string;
      }>;
      if (parsed.pagamento) this.pagamento = parsed.pagamento;
      this.selectedEnderecoId = parsed.enderecoId ?? this.selectedEnderecoId;
      this.selectedTelefoneId = parsed.telefoneId ?? this.selectedTelefoneId;
      this.chavePix = parsed.chavePix || '';
      this.linhaDigitavelBoleto = parsed.linhaDigitavelBoleto || '';
      this.ultimosDigitosCartao = parsed.ultimosDigitosCartao || '';
      this.nomeTitularCartao = parsed.nomeTitularCartao || '';
      this.bandeiraCartao = parsed.bandeiraCartao || '';
    } catch {
      // ignore parse errors
    }

    if (this.items().length) {
      this.checkout();
      return;
    }

    this.carrinhoService.fetchCarrinho().subscribe({
      next: () => this.checkout(),
      error: () => {}
    });
  }

  private loadDadosCliente(): void {
    this.isLoadingDados.set(true);
    console.log('Iniciando carregamento de dados do cliente...');
    
    // Primeiro buscar os dados do usuário para obter o ID
    this.usuarioService.getMe().subscribe({
      next: (usuario) => {
        console.log('Usuário carregado:', usuario);
        
        if (usuario.id) {
          // Usar os endpoints aninhados com o userId
          this.loadEnderecosETelefonesComUserId(usuario.id);
        } else {
          console.warn('Usuário sem ID, tentando fallback...');
          this.loadEnderecosETelefones();
        }
        
        // Também verificar se os dados já vieram no objeto usuário
        const enderecos = usuario.enderecos || [];
        const telefones = usuario.telefones || [];
        
        if (enderecos.length > 0) {
          console.log('Endereços encontrados no usuário:', enderecos);
          this.enderecos.set(enderecos);
          if (!this.selectedEnderecoId) {
            this.selectedEnderecoId = enderecos[0]?.id ?? null;
          }
        }
        if (telefones.length > 0) {
          console.log('Telefones encontrados no usuário:', telefones);
          this.telefones.set(telefones);
          if (!this.selectedTelefoneId) {
            this.selectedTelefoneId = telefones[0]?.id ?? null;
          }
        }
        
        setTimeout(() => this.isLoadingDados.set(false), 1000);
      },
      error: (err) => {
        console.error('Erro ao carregar dados do usuário:', err);
        // Tentar fallback sem userId
        this.loadEnderecosETelefones();
        setTimeout(() => this.isLoadingDados.set(false), 2000);
      }
    });
  }

  private loadEnderecosETelefonesComUserId(userId: number): void {
    console.log('Carregando endereços e telefones com userId:', userId);
    
    // Buscar endereços do usuário específico
    this.enderecoService.findEnderecosByUsuario(userId).subscribe({
      next: (enderecos) => {
        console.log('Endereços carregados do endpoint /usuarios/' + userId + '/enderecos:', enderecos);
        this.enderecos.set(enderecos || []);
        if (enderecos && enderecos.length > 0) {
          if (!this.selectedEnderecoId) {
            this.selectedEnderecoId = enderecos[0]?.id ?? null;
            console.log('Endereço selecionado automaticamente:', this.selectedEnderecoId);
          }
        } else {
          console.warn('Nenhum endereço encontrado para o usuário');
        }
        this.isLoadingDados.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar endereços do usuário:', err);
        // Tentar outros endpoints como fallback
        this.loadEnderecosETelefones();
      }
    });

    // Buscar telefones do usuário específico
    this.telefoneService.findTelefonesByUsuario(userId).subscribe({
      next: (telefones) => {
        console.log('Telefones carregados do endpoint /usuarios/' + userId + '/telefones:', telefones);
        this.telefones.set(telefones || []);
        if (telefones && telefones.length > 0) {
          if (!this.selectedTelefoneId) {
            this.selectedTelefoneId = telefones[0]?.id ?? null;
            console.log('Telefone selecionado automaticamente:', this.selectedTelefoneId);
          }
        } else {
          console.warn('Nenhum telefone encontrado para o usuário');
        }
        this.isLoadingDados.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar telefones do usuário:', err);
        // Tentar outros endpoints como fallback
        this.loadEnderecosETelefones();
      }
    });
  }

  private loadEnderecosETelefones(): void {
    console.log('Carregando endereços e telefones do cliente...');
    
    // Buscar endereços do cliente
    this.enderecoService.findMeusEnderecos().subscribe({
      next: (enderecos) => {
        console.log('Endereços carregados do endpoint /cliente/enderecos:', enderecos);
        this.enderecos.set(enderecos || []);
        if (enderecos && enderecos.length > 0) {
          if (!this.selectedEnderecoId) {
            this.selectedEnderecoId = enderecos[0]?.id ?? null;
            console.log('Endereço selecionado automaticamente:', this.selectedEnderecoId);
          }
        } else {
          console.warn('Nenhum endereço encontrado');
        }
      },
      error: (err) => {
        console.error('Erro ao carregar endereços de /cliente/enderecos:', err);
        // Tentar fallback
        this.enderecoService.findMeusEnderecosFallback().subscribe({
          next: (enderecos) => {
            console.log('Endereços carregados do endpoint fallback:', enderecos);
            this.enderecos.set(enderecos || []);
            if (enderecos && enderecos.length > 0 && !this.selectedEnderecoId) {
              this.selectedEnderecoId = enderecos[0]?.id ?? null;
            }
          },
          error: (err2) => {
            console.error('Erro ao carregar endereços do fallback:', err2);
            // Último fallback: buscar do findAll
            this.enderecoService.findAll().subscribe({
              next: (enderecos) => {
                console.log('Endereços carregados do findAll:', enderecos);
                this.enderecos.set(enderecos || []);
                if (enderecos && enderecos.length > 0 && !this.selectedEnderecoId) {
                  this.selectedEnderecoId = enderecos[0]?.id ?? null;
                }
              },
              error: (err3) => {
                console.error('Erro final ao carregar endereços:', err3);
                this.enderecos.set([]);
              }
            });
          }
        });
      }
    });

    // Buscar telefones do cliente
    this.telefoneService.findMeusTelefones().subscribe({
      next: (telefones) => {
        console.log('Telefones carregados do endpoint /cliente/telefones:', telefones);
        this.telefones.set(telefones || []);
        if (telefones && telefones.length > 0) {
          if (!this.selectedTelefoneId) {
            this.selectedTelefoneId = telefones[0]?.id ?? null;
            console.log('Telefone selecionado automaticamente:', this.selectedTelefoneId);
          }
        } else {
          console.warn('Nenhum telefone encontrado');
        }
      },
      error: (err) => {
        console.error('Erro ao carregar telefones de /cliente/telefones:', err);
        // Tentar fallback
        this.telefoneService.findMeusTelefonesFallback().subscribe({
          next: (telefones) => {
            console.log('Telefones carregados do endpoint fallback:', telefones);
            this.telefones.set(telefones || []);
            if (telefones && telefones.length > 0 && !this.selectedTelefoneId) {
              this.selectedTelefoneId = telefones[0]?.id ?? null;
            }
          },
          error: (err2) => {
            console.error('Erro ao carregar telefones do fallback:', err2);
            // Último fallback: buscar do list
            this.telefoneService.list().subscribe({
              next: (telefones) => {
                console.log('Telefones carregados do list:', telefones);
                this.telefones.set(telefones || []);
                if (telefones && telefones.length > 0 && !this.selectedTelefoneId) {
                  this.selectedTelefoneId = telefones[0]?.id ?? null;
                }
              },
              error: (err3) => {
                console.error('Erro final ao carregar telefones:', err3);
                this.telefones.set([]);
              }
            });
          }
        });
      }
    });
  }

  private buildPagamentoPayload(): Partial<CompraPayload> | null {
    switch (this.pagamento) {
      case FormaPagamento.PIX:
        if (!this.chavePix.trim()) {
          this.checkoutError = 'Informe a chave PIX.';
          return null;
        }
        return { chavePix: this.chavePix.trim() };
      case FormaPagamento.BOLETO:
        if (!this.linhaDigitavelBoleto.trim()) {
          this.checkoutError = 'Informe a linha digitável do boleto.';
          return null;
        }
        return { linhaDigitavelBoleto: this.linhaDigitavelBoleto.trim() };
      case FormaPagamento.CARTAO:
      default:
        if (!this.ultimosDigitosCartao.trim()) {
          this.checkoutError = 'Informe ao menos os últimos dígitos do cartão.';
          return null;
        }
        return {
          ultimosDigitosCartao: this.ultimosDigitosCartao.trim(),
          nomeTitularCartao: this.nomeTitularCartao?.trim() || undefined,
          bandeiraCartao: this.bandeiraCartao?.trim() || undefined
        };
    }
  }
}
