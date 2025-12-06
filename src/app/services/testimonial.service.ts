import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Testimonial } from '@models/testimonial.model';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private baseUrl = 'http://localhost:8080/depoimento';

  constructor(private httpClient: HttpClient) {}

  getPublicos(): Observable<Testimonial[]> {
    return this.httpClient.get<Testimonial[]>(this.baseUrl);
  }
}
