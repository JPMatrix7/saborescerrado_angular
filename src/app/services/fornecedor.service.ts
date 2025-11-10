import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParceiroComercial } from '../models/fornecedor.model';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private baseUrl = 'http://localhost:8080/parceirocomercial';

  constructor(private httpClient: HttpClient) { }

  // Métodos no estilo do exemplo fornecido
  getParceiros(page?: number, pageSize?: number): Observable<ParceiroComercial[]> {
    let params = {};

    if ((page !== undefined) && (pageSize !== undefined)) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      };
    }

    return this.httpClient.get<ParceiroComercial[]>(this.baseUrl, { params });
  }

  buscarPorId(id: string): Observable<ParceiroComercial> {
    return this.httpClient.get<ParceiroComercial>(`${this.baseUrl}/${id}`);
  }

  incluir(parceiro: any): Observable<ParceiroComercial> {
    return this.httpClient.post<ParceiroComercial>(this.baseUrl, parceiro);
  }

  alterar(parceiro: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/${parceiro.id}`, parceiro);
  }

  excluir(parceiro: ParceiroComercial): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${parceiro.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  // Métodos compatíveis com componentes existentes
  findAll(): Observable<ParceiroComercial[]> {
    return this.getParceiros();
  }

  findById(id: number): Observable<ParceiroComercial> {
    return this.httpClient.get<ParceiroComercial>(`${this.baseUrl}/${id}`);
  }

  create(parceiro: ParceiroComercial): Observable<ParceiroComercial> {
    return this.incluir(parceiro);
  }

  update(id: number, parceiro: ParceiroComercial): Observable<ParceiroComercial> {
    return this.httpClient.put<ParceiroComercial>(`${this.baseUrl}/${id}`, parceiro);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Métodos específicos da API
  getByCnpj(cnpj: string): Observable<ParceiroComercial> {
    return this.httpClient.get<ParceiroComercial>(`${this.baseUrl}/cnpj/${cnpj}`);
  }

  getByNomeFantasia(nome: string): Observable<ParceiroComercial[]> {
    return this.httpClient.get<ParceiroComercial[]>(`${this.baseUrl}/nome-fantasia/${nome}`);
  }
}
