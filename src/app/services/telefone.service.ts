import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Telefone, TelefonePayload } from '../models/telefone.model';

@Injectable({
  providedIn: 'root'
})
export class TelefoneService {
  private baseUrl = 'http://localhost:8080/telefone';

  constructor(private httpClient: HttpClient) {}

  create(payload: TelefonePayload): Observable<Telefone> {
    return this.httpClient.post<Telefone>(this.baseUrl, payload);
  }

  update(id: number, payload: TelefonePayload): Observable<Telefone> {
    return this.httpClient.put<Telefone>(`${this.baseUrl}/${id}`, payload);
  }

  getById(id: number): Observable<Telefone> {
    return this.httpClient.get<Telefone>(`${this.baseUrl}/${id}`);
  }
}
