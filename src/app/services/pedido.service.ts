import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra } from '../models/compra.model';
import { StatusPedido } from '../models/enums.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = 'http://localhost:8080/compra';
  private adminUrl = 'http://localhost:8080/compra/admin';

  constructor(private httpClient: HttpClient) {}

  // Usuário: lista suas compras (opcional filtro por status)
  getCompras(status?: StatusPedido): Observable<Compra[]> {
    if (status) {
      return this.httpClient.get<Compra[]>(`${this.baseUrl}/status/${status}`);
    }
    return this.httpClient.get<Compra[]>(this.baseUrl);
  }

  // Usuário: detalhe da própria compra
  buscarPorId(id: number): Observable<Compra> {
    return this.httpClient.get<Compra>(`${this.baseUrl}/${id}`);
  }

  // Usuário: cria compra (usa usuário do token)
  incluir(compra: Partial<Compra>): Observable<Compra> {
    return this.httpClient.post<Compra>(this.baseUrl, compra);
  }

  // Usuário/Admin: altera status, rastreio ou itens conforme regra do backend
  update(id: number, compra: Partial<Compra>): Observable<Compra> {
    return this.httpClient.put<Compra>(`${this.baseUrl}/${id}`, compra);
  }

  // Usuário/Admin: cancelar compra
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Admin: lista paginada de todas as compras
  adminList(page: number, pageSize: number): Observable<Compra[]> {
    return this.httpClient.get<Compra[]>(`${this.adminUrl}/${page}/${pageSize}`);
  }

  // Admin: detalhe por id
  adminGetById(id: number): Observable<Compra> {
    return this.httpClient.get<Compra>(`${this.adminUrl}/id/${id}`);
  }

  // Admin: atualizar status
  updateStatus(id: number, status: StatusPedido): Observable<Compra> {
    return this.httpClient.put<Compra>(`${this.baseUrl}/${id}`, { status });
  }

  // Admin: atualizar código de rastreio
  updateRastreio(id: number, codigoRastreio: string): Observable<Compra> {
    return this.httpClient.put<Compra>(`${this.baseUrl}/${id}`, { codigoRastreio });
  }

  // Usuário/Admin: buscar por status (alias explícito)
  getByStatus(status: StatusPedido): Observable<Compra[]> {
    return this.httpClient.get<Compra[]>(`${this.baseUrl}/status/${status}`);
  }
}
