import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endereco, EnderecoPayload } from '../models/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private baseUrl = 'http://localhost:8080/endereco';

  constructor(private httpClient: HttpClient) {}

  create(payload: EnderecoPayload): Observable<Endereco> {
    return this.httpClient.post<Endereco>(this.baseUrl, payload);
  }

  update(id: number, payload: EnderecoPayload): Observable<Endereco> {
    return this.httpClient.put<Endereco>(`${this.baseUrl}/${id}`, payload);
  }

  getById(id: number): Observable<Endereco> {
    return this.httpClient.get<Endereco>(`${this.baseUrl}/${id}`);
  }
}
