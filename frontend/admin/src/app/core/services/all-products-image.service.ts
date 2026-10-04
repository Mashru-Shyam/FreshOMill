import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';

interface AllProductsImageDto {
  imageUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class AllProductsImageService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/api/v1`;

  get(): Observable<string | null> {
    return this.http
      .get<AllProductsImageDto>(`${this.base}/all-products-image`)
      .pipe(map((dto) => toAbsoluteImageUrl(dto.imageUrl)));
  }

  update(imageUrl: string | null): Observable<unknown> {
    return this.http.put(`${this.base}/admin/all-products-image`, { imageUrl });
  }
}
