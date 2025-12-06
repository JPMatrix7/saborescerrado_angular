import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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

    this.pedidoService.adminList(0, 100).subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : [];
        this.pedidos.set(lista);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.pedidos.set([]);
        this.error.set((err as any)?.error?.message || (err as any)?.message || 'Erro ao carregar pedidos.');
      }
    });
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

  verDetalhes(pedido: Compra): void {
    console.log('Ver detalhes do pedido:', pedido);
  }

  cancelarPedido(id: number): void {
    if (confirm('Deseja realmente cancelar este pedido?')) {
      console.log('Cancelando pedido:', id);
      // Atualizar status localmente enquanto não há fluxo de cancelamento no backend
      const pedidos = this.pedidos();
      const index = pedidos.findIndex(p => p.id === id);
      if (index !== -1) {
        pedidos[index].status = StatusPedido.CANCELADO;
        this.pedidos.set([...pedidos]);
      }
    }
  }

  voltar(): void {
    this.location.back();
  }
}
