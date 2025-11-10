import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SafraLicor } from '../models/licor.model';

@Injectable({
  providedIn: 'root'
})
export class SafraService {
  private baseUrl = 'http://localhost:8080/safralicor';

  constructor(private httpClient: HttpClient) { }

  findAll(): Observable<SafraLicor[]> {
    return this.httpClient.get<SafraLicor[]>(this.baseUrl);
  }

  findById(id: number): Observable<SafraLicor> {
    return this.httpClient.get<SafraLicor>(`${this.baseUrl}/${id}`);
  }

  create(safra: SafraLicor): Observable<SafraLicor> {
    return this.httpClient.post<SafraLicor>(this.baseUrl, safra);
  }

  update(id: number, safra: SafraLicor): Observable<SafraLicor> {
    return this.httpClient.put<SafraLicor>(`${this.baseUrl}/${id}`, safra);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
