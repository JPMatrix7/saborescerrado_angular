import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Compra } from '../models/compra.model';
import { StatusPedido } from '../models/enums.model';
import { AuthService } from '@services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = 'http://localhost:8080/compra';

  constructor(private httpClient: HttpClient, private authService: AuthService) { }

  // Métodos no estilo do exemplo fornecido
  getCompras(page?: number, pageSize?: number): Observable<Compra[]> {
    let params = {};

    if ((page !== undefined) && (pageSize !== undefined)) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      };
    }

    return this.httpClient.get<Compra[]>(this.baseUrl, { params });
  }

  buscarPorId(id: string): Observable<Compra> {
    return this.httpClient.get<Compra>(`${this.baseUrl}/${id}`);
  }

  incluir(compra: any): Observable<Compra> {
    if (this.authService.isAdmin()) {
      return throwError(() => new Error('Administradores não podem criar compras.'));
    }
    return this.httpClient.post<Compra>(this.baseUrl, compra);
  }

  alterar(compra: any): Observable<any> {
    if (this.authService.isAdmin()) {
      return throwError(() => new Error('Administradores não podem alterar compras.'));
    }
    return this.httpClient.put<any>(`${this.baseUrl}/${compra.id}`, compra);
  }

  excluir(compra: Compra): Observable<any> {
    if (this.authService.isAdmin()) {
      return throwError(() => new Error('Administradores não podem excluir compras.'));
    }
    return this.httpClient.delete<any>(`${this.baseUrl}/${compra.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  // Métodos compatíveis com componentes existentes
  findAll(): Observable<Compra[]> {
    return this.getCompras();
  }

  findById(id: number): Observable<Compra> {
    return this.httpClient.get<Compra>(`${this.baseUrl}/${id}`);
  }

  findByUsuario(usuarioId: number): Observable<Compra[]> {
    return this.httpClient.get<Compra[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  create(compra: Compra): Observable<Compra> {
    return this.incluir(compra);
  }

  update(id: number, compra: Compra): Observable<Compra> {
    if (this.authService.isAdmin()) {
      return throwError(() => new Error('Administradores não podem alterar compras.'));
    }
    return this.httpClient.put<Compra>(`${this.baseUrl}/${id}`, compra);
  }

  updateStatus(id: number, status: StatusPedido): Observable<Compra> {
    return this.httpClient.patch<Compra>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Métodos específicos da API
  getByStatus(status: number): Observable<Compra[]> {
    return this.httpClient.get<Compra[]>(`${this.baseUrl}/status/${status}`);
  }

  getByRastreio(codigo: string): Observable<Compra> {
    return this.httpClient.get<Compra>(`${this.baseUrl}/rastreio/${codigo}`);
  }
}
