import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ImagesService {
  private readonly http = inject(HttpClient);

  /** Returns the uploaded image's full absolute URL, ready to store directly on a
   * product/category's imageUrl field — matches how every other image URL in this app already
   * resolves (API_BASE_URL + the relative path the backend returns). */
  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ url: string }>(`${API_BASE_URL}/api/v1/admin/images`, formData)
      .pipe(map((response) => `${API_BASE_URL}${response.url}`));
  }
}
