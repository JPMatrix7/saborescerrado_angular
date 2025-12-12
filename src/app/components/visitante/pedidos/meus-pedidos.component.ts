import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '@services/pedido.service';
import { AuthService } from '@services/auth.service';
import { Compra, ItemCompra } from '@models/compra.model';
import { StatusPedido } from '@models/enums.model';

interface StatusOption {
  value: StatusPedido | 'todos';
  label: string;
}

@Component({
  selector: 'app-meus-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  templateUrl: './meus-pedidos.component.html',
  styleUrl: './meus-pedidos.component.css'
})
export class MeusPedidosComponent implements OnInit {
  isLoading = true;
  error = '';
  successMessage = '';
  pedidos = signal<Compra[]>([]);
  filtered = signal<Compra[]>([]);
  statuses: StatusOption[] = [
    { value: 'todos', label: 'Todos' },
    { value: StatusPedido.PENDENTE, label: 'Pendente' },
    { value: StatusPedido.APROVADO, label: 'Aprovado' },
    { value: StatusPedido.ENVIADO, label: 'Enviado' },
    { value: StatusPedido.ENTREGUE, label: 'Entregue' },
    { value: StatusPedido.CANCELADO, label: 'Cancelado' }
  ];
  selectedStatus: StatusOption['value'] = 'todos';

  constructor(
    private pedidoService: PedidoService, 
    private authService: AuthService,
    private router: Router
  ) {
    // Verificar se veio de uma compra bem-sucedida
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['novoPedido']) {
      this.successMessage = navigation.extras.state['mensagem'] || 'Pedido criado com sucesso!';
      // Limpar a mensagem após 10 segundos
      setTimeout(() => this.successMessage = '', 10000);
    }
  }

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.isLoading = true;
    this.error = '';
    this.pedidoService.getMeusPedidos().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.pedidos.set(list);
        this.aplicarFiltro();
        this.isLoading = false;
      },
      error: (err: unknown) => {
        this.isLoading = false;
        if ((err as any)?.status === 401 || (err as any)?.status === 403) {
          this.error = 'Faça login para ver seus pedidos.';
        } else {
          this.error = (err as any)?.error?.message || (err as any)?.message || 'Erro ao carregar pedidos.';
        }
      }
    });
  }

  onStatusChange(value: StatusOption['value']): void {
    this.selectedStatus = value;
    this.aplicarFiltro();
  }

  statusChip(status: StatusPedido): string {
    switch (status) {
      case StatusPedido.PENDENTE: return 'chip warn';
      case StatusPedido.APROVADO: return 'chip info';
      case StatusPedido.ENVIADO: return 'chip info';
      case StatusPedido.ENTREGUE: return 'chip success';
      case StatusPedido.CANCELADO: return 'chip danger';
      default: return 'chip';
    }
  }

  pagoChip(pago?: boolean): string {
    return pago ? 'badge success' : 'badge muted';
  }

  pedidoTotal(pedido: Compra): number {
    if (!pedido.itens) return pedido.valorTotal || 0;
    return pedido.itens.reduce((sum: number, item: ItemCompra) => sum + (item.precoUnitario || 0) * item.quantidade, 0);
  }

  private aplicarFiltro(): void {
    if (this.selectedStatus === 'todos') {
      this.filtered.set(this.pedidos());
      return;
    }
    this.filtered.set(this.pedidos().filter(p => p.status === this.selectedStatus));
  }
}
