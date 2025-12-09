import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endereco, EnderecoDTO } from '../models/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private baseUrl = 'http://localhost:8080/endereco';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(this.baseUrl);
  }

  getById(id: number): Observable<Endereco> {
    return this.httpClient.get<Endereco>(`${this.baseUrl}/${id}`);
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
