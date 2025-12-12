import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { Compra } from '@models/compra.model';
import { StatusPedido, FormaPagamento } from '@models/enums.model';
import { PedidoService } from '@services/pedido.service';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule
  ],
  templateUrl: './pedido-list.component.html',
  styleUrl: './pedido-list.component.css'
})
export class PedidoListComponent implements OnInit {
  pedidos = signal<Compra[]>([]);
  loading = signal(false);
  error = signal('');
  displayedColumns: string[] = ['id', 'dataCompra', 'valorTotal', 'status', 'formaPagamento', 'acoes'];
  statusFiltro: StatusPedido | 'todos' = 'todos';
  statusOptions = Object.values(StatusPedido);
  statusForm: Record<number, StatusPedido> = {};

  constructor(
    private router: Router,
    private location: Location,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading.set(true);
    this.error.set('');

    this.pedidoService.adminList().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : [];
        this.pedidos.set(lista);
        this.hidratarFormularios(lista);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.pedidos.set([]);
        this.error.set((err as any)?.error?.message || (err as any)?.message || 'Erro ao carregar pedidos.');
      }
    });
  }

  pedidosFiltrados(): Compra[] {
    if (this.statusFiltro === 'todos') return this.pedidos();
    return this.pedidos().filter(p => p.status === this.statusFiltro);
  }

  getStatusColor(status: StatusPedido): string {
    switch (status) {
      case StatusPedido.PENDENTE: return 'warn';
      case StatusPedido.APROVADO: return 'primary';
      case StatusPedido.CANCELADO: return 'accent';
      case StatusPedido.ENVIADO: return 'primary';
      case StatusPedido.ENTREGUE: return '';
      default: return '';
    }
  }

  getStatusLabel(status: StatusPedido): string {
    switch (status) {
      case StatusPedido.PENDENTE: return 'Pendente';
      case StatusPedido.APROVADO: return 'Aprovado';
      case StatusPedido.CANCELADO: return 'Cancelado';
      case StatusPedido.ENVIADO: return 'Enviado';
      case StatusPedido.ENTREGUE: return 'Entregue';
      default: return status;
    }
  }

  getFormaPagamentoLabel(forma: FormaPagamento): string {
    switch (forma) {
      case FormaPagamento.CARTAO: return 'Cartão';
      case FormaPagamento.PIX: return 'PIX';
      case FormaPagamento.BOLETO: return 'Boleto';
      default: return forma;
    }
  }

  salvarStatus(pedido: Compra): void {
    if (!pedido.id) return;
    const novoStatus = this.statusForm[pedido.id];
    this.pedidoService.adminUpdateStatus(pedido.id, novoStatus).subscribe({
      next: (atualizado) => this.substituirPedido(atualizado),
      error: (err: any) => {
        this.error.set(err?.error?.message || err?.message || 'Erro ao atualizar status.');
      }
    });
  }

  cancelarPedido(id: number): void {
    if (confirm('Deseja realmente cancelar este pedido?')) {
      this.pedidoService.delete(id).subscribe({
        next: () => {
          this.pedidos.set(this.pedidos().filter(p => p.id !== id));
        },
        error: (err: any) => {
          this.error.set(err?.error?.message || err?.message || 'Erro ao cancelar pedido.');
        }
      });
    }
  }

  verDetalhes(pedido: Compra): void {
    console.log('Ver detalhes do pedido:', pedido);
  }

  voltar(): void {
    this.location.back();
  }

  private hidratarFormularios(lista: Compra[]): void {
    this.statusForm = {};
    lista.forEach((pedido) => {
      if (!pedido.id) return;
      this.statusForm[pedido.id] = pedido.status;
    });
  }

  private substituirPedido(atualizado: Compra): void {
    if (!atualizado.id) return;
    const lista = this.pedidos().map(p => (p.id === atualizado.id ? atualizado : p));
    this.pedidos.set(lista);
    this.hidratarFormularios(lista);
  }
}
