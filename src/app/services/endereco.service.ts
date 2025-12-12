import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endereco, EnderecoDTO } from '../models/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private baseUrl = 'http://localhost:8080/endereco';
  private adminUrl = 'http://localhost:8080/endereco/admin';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(this.baseUrl);
  }

  findMeusEnderecos(): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>('http://localhost:8080/cliente/enderecos');
  }

  findEnderecosByUsuario(userId: number): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(`http://localhost:8080/usuarios/${userId}/enderecos`);
  }

  createEnderecoUsuario(userId: number, payload: EnderecoDTO): Observable<Endereco> {
    return this.httpClient.post<Endereco>(`http://localhost:8080/usuarios/${userId}/enderecos`, payload);
  }

  findMeusEnderecosFallback(): Observable<Endereco[]> {
    // Fallback: tenta buscar do endpoint genérico
    return this.httpClient.get<Endereco[]>(`${this.baseUrl}/meus`);
  }

  findAllAdmin(page: number = 0, pageSize: number = 100): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(`${this.adminUrl}/${page}/${pageSize}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  getById(id: number): Observable<Endereco> {
    return this.httpClient.get<Endereco>(`${this.baseUrl}/${id}`);
  }

  getByIdAdmin(id: number): Observable<Endereco> {
    return this.httpClient.get<Endereco>(`${this.adminUrl}/id/${id}`);
  }

  getByCep(cep: string): Observable<Endereco> {
    return this.httpClient.get<Endereco>(`${this.baseUrl}/cep/${cep}`);
  }

  create(payload: EnderecoDTO): Observable<Endereco> {
    return this.httpClient.post<Endereco>(this.baseUrl, payload);
  }

  update(id: number, payload: EnderecoDTO): Observable<Endereco> {
    return this.httpClient.put<Endereco>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
