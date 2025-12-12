import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avaliacao } from '@models/licor.model';

export interface AvaliacaoPayload {
  licorId: number;
  estrelas: number;
  comentario?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvaliacaoService {
  private baseUrl = 'http://localhost:8080/avaliacao';
  private adminUrl = 'http://localhost:8080/avaliacao/admin';

  constructor(private http: HttpClient) {}

  listar(): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(this.baseUrl);
  }

  listarAdmin(page: number = 0, pageSize: number = 100): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.adminUrl}/${page}/${pageSize}`);
  }

  count(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  getById(id: number): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.baseUrl}/${id}`);
  }

  adminGetById(id: number): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.adminUrl}/id/${id}`);
  }

  listarPorEstrelas(estrelas: number): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.baseUrl}/estrelas/${estrelas}`);
  }

  listarPorLicor(licorId: number): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.baseUrl}/licor/${licorId}`);
  }

  criar(payload: AvaliacaoPayload): Observable<Avaliacao> {
    return this.http.post<Avaliacao>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: Partial<AvaliacaoPayload>): Observable<Avaliacao> {
    return this.http.put<Avaliacao>(`${this.baseUrl}/${id}`, payload);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
