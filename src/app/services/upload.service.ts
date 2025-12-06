import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface UploadResponse {
  url: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private baseUrl = 'http://localhost:8080/upload/imagem';

  constructor(private http: HttpClient) {}

  uploadImagem(file: File, fileName?: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (fileName) {
      formData.append('fileName', fileName);
    }
    return this.http.post<UploadResponse>(this.baseUrl, formData);
  }
}
