import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Telefone, TelefonePayload } from '../models/telefone.model';

@Injectable({
  providedIn: 'root'
})
export class TelefoneService {
  private baseUrl = 'http://localhost:8080/telefone';
  private adminUrl = 'http://localhost:8080/telefone/admin';

  constructor(private httpClient: HttpClient) {}

  list(): Observable<Telefone[]> {
    return this.httpClient.get<Telefone[]>(this.baseUrl);
  }

  findMeusTelefones(): Observable<Telefone[]> {
    return this.httpClient.get<Telefone[]>('http://localhost:8080/cliente/telefones');
  }

  findTelefonesByUsuario(userId: number): Observable<Telefone[]> {
    return this.httpClient.get<Telefone[]>(`http://localhost:8080/usuarios/${userId}/telefones`);
  }

  createTelefoneUsuario(userId: number, payload: TelefonePayload): Observable<Telefone> {
    return this.httpClient.post<Telefone>(`http://localhost:8080/usuarios/${userId}/telefones`, payload);
  }

  findMeusTelefonesFallback(): Observable<Telefone[]> {
    // Fallback: tenta buscar do endpoint genérico
    return this.httpClient.get<Telefone[]>(`${this.baseUrl}/meus`);
  }

  adminList(page: number = 0, pageSize: number = 100): Observable<Telefone[]> {
    return this.httpClient.get<Telefone[]>(`${this.adminUrl}/${page}/${pageSize}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  create(payload: TelefonePayload): Observable<Telefone> {
    return this.httpClient.post<Telefone>(this.baseUrl, payload);
  }

  update(id: number, payload: TelefonePayload): Observable<Telefone> {
    return this.httpClient.put<Telefone>(`${this.baseUrl}/${id}`, payload);
  }

  getById(id: number): Observable<Telefone> {
    return this.httpClient.get<Telefone>(`${this.baseUrl}/${id}`);
  }

  getByIdAdmin(id: number): Observable<Telefone> {
    return this.httpClient.get<Telefone>(`${this.adminUrl}/id/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
