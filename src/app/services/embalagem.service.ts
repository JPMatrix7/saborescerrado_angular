import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Embalagem } from '../models/licor.model';

@Injectable({
  providedIn: 'root'
})
export class EmbalagemService {
  private baseUrl = 'http://localhost:8080/embalagem';

  constructor(private httpClient: HttpClient) { }

  findAll(): Observable<Embalagem[]> {
    return this.httpClient.get<Embalagem[]>(this.baseUrl);
  }

  findById(id: number): Observable<Embalagem> {
    return this.httpClient.get<Embalagem>(`${this.baseUrl}/${id}`);
  }

  create(embalagem: Embalagem): Observable<Embalagem> {
    return this.httpClient.post<Embalagem>(this.baseUrl, embalagem);
  }

  update(id: number, embalagem: Embalagem): Observable<Embalagem> {
    return this.httpClient.put<Embalagem>(`${this.baseUrl}/${id}`, embalagem);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
