import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra, CompraPayload } from '../models/compra.model';
import { StatusPedido } from '../models/enums.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = 'http://localhost:8080/compra';
  private adminUrl = 'http://localhost:8080/compra/admin';

  constructor(private httpClient: HttpClient) {}

  // Usuário/Admin: lista compras (pode filtrar por status)
  getCompras(status?: StatusPedido): Observable<Compra[]> {
    if (status) {
      return this.httpClient.get<Compra[]>(`${this.baseUrl}/status/${status}`);
    }
    return this.httpClient.get<Compra[]>(this.baseUrl);
  }

  // Usuário/Admin: detalhe
  buscarPorId(id: number): Observable<Compra> {
    return this.httpClient.get<Compra>(`${this.baseUrl}/${id}`);
  }

  // Usuário/Admin: cria compra
  incluir(compra: CompraPayload): Observable<Compra> {
    return this.httpClient.post<Compra>(this.baseUrl, compra);
  }

  // Usuário/Admin: atualiza compra
  update(id: number, compra: Partial<Compra>): Observable<Compra> {
    return this.httpClient.put<Compra>(`${this.baseUrl}/${id}`, compra);
  }

  // Usuário/Admin: cancelar compra
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Admin: lista paginada
  adminList(page: number = 0, pageSize: number = 100): Observable<Compra[]> {
    return this.httpClient.get<Compra[]>(`${this.adminUrl}/${page}/${pageSize}`);
  }

  // Admin: detalhe
  adminGetById(id: number): Observable<Compra> {
    return this.httpClient.get<Compra>(`${this.adminUrl}/id/${id}`);
  }

  // Admin: atualizar status
  adminUpdateStatus(id: number, status: StatusPedido): Observable<Compra> {
    return this.httpClient.patch<Compra>(`${this.adminUrl}/${id}/status`, status);
  }

  // Admin: atualizar pagamento
  adminUpdatePagamento(
    id: number,
    payload: Partial<Pick<Compra, 'pago' | 'formaPagamento' | 'chavePix' | 'linhaDigitavelBoleto' | 'ultimosDigitosCartao' | 'nomeTitularCartao' | 'bandeiraCartao'>>
  ): Observable<Compra> {
    return this.httpClient.patch<Compra>(`${this.adminUrl}/${id}/pagamento`, payload);
  }

  // Admin: atualizar entrega
  adminUpdateEntrega(
    id: number,
    payload: Partial<Pick<Compra, 'codigoRastreio' | 'dataPrevista' | 'dataEntrega' | 'status'>>
  ): Observable<Compra> {
    return this.httpClient.patch<Compra>(`${this.adminUrl}/${id}/entrega`, payload);
  }

  // Usuário/Admin: rastrear pedido
  rastrear(codigo: string): Observable<Compra> {
    return this.httpClient.get<Compra>(`${this.baseUrl}/rastreio/${codigo}`);
  }

  // Usuário logado: meus pedidos
  getMeusPedidos(): Observable<Compra[]> {
    return this.httpClient.get<Compra[]>(`http://localhost:8080/usuario/meus-pedidos`);
  }

  // Usuário logado: detalhe de pedido específico
  getMeuPedido(id: number): Observable<Compra> {
    return this.httpClient.get<Compra>(`http://localhost:8080/usuario/meus-pedidos/${id}`);
  }
}
