import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { Compra, ItemCompra } from '@models/compra.model';
import { StatusPedido, FormaPagamento } from '@models/enums.model';

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
  displayedColumns: string[] = ['id', 'dataCompra', 'valorTotal', 'status', 'formaPagamento', 'acoes'];

  constructor(private router: Router, private location: Location) {}

  ngOnInit(): void {
    console.log('PedidoListComponent - ngOnInit chamado');
    this.loadPedidos();
  }

  loadPedidos(): void {
    console.log('Carregando pedidos...');
    // Dados estáticos para demonstração
    const pedidosEstaticos: Compra[] = [
      {
        id: 1,
        dataCompra: new Date('2024-01-15'),
        status: StatusPedido.ENTREGUE,
        formaPagamento: FormaPagamento.CARTAO,
        valorTotal: 250.00,
        codigoRastreio: 'BR123456789',
        dataPrevista: new Date('2024-01-20'),
        dataEntrega: new Date('2024-01-19'),
        pago: true,
        itens: [
          {
            id: 1,
            licor: { id: 1, nome: 'Licor de Pequi', preco: 45.00 } as any,
            quantidade: 2,
            precoUnitario: 45.00,
            subtotal: 90.00
          },
          {
            id: 2,
            licor: { id: 2, nome: 'Licor de Buriti', preco: 80.00 } as any,
            quantidade: 2,
            precoUnitario: 80.00,
            subtotal: 160.00
          }
        ]
      },
      {
        id: 2,
        dataCompra: new Date('2024-02-10'),
        status: StatusPedido.ENVIADO,
        formaPagamento: FormaPagamento.PIX,
        valorTotal: 180.00,
        codigoRastreio: 'BR987654321',
        dataPrevista: new Date('2024-02-18'),
        pago: true,
        itens: [
          {
            id: 3,
            licor: { id: 3, nome: 'Licor de Cagaita', preco: 60.00 } as any,
            quantidade: 3,
            precoUnitario: 60.00,
            subtotal: 180.00
          }
        ]
      },
      {
        id: 3,
        dataCompra: new Date('2024-03-05'),
        status: StatusPedido.PENDENTE,
        formaPagamento: FormaPagamento.BOLETO,
        valorTotal: 120.00,
        pago: false,
        itens: [
          {
            id: 4,
            licor: { id: 4, nome: 'Licor de Jenipapo', preco: 40.00 } as any,
            quantidade: 3,
            precoUnitario: 40.00,
            subtotal: 120.00
          }
        ]
      },
      {
        id: 4,
        dataCompra: new Date('2024-03-20'),
        status: StatusPedido.APROVADO,
        formaPagamento: FormaPagamento.CARTAO,
        valorTotal: 350.00,
        pago: true,
        itens: [
          {
            id: 5,
            licor: { id: 1, nome: 'Licor de Pequi', preco: 45.00 } as any,
            quantidade: 3,
            precoUnitario: 45.00,
            subtotal: 135.00
          },
          {
            id: 6,
            licor: { id: 5, nome: 'Licor de Mangaba', preco: 65.00 } as any,
            quantidade: 3,
            precoUnitario: 65.00,
            subtotal: 195.00
          }
        ]
      }
    ];
    this.pedidos.set(pedidosEstaticos);
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
      // Atualizar status localmente
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
