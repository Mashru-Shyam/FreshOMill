import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  displayOrder: number;
}

export interface CategoryInput {
  name: string;
  imageUrl: string | null;
  displayOrder: number;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/api/v1/admin/categories`;

  list(): Observable<AdminCategory[]> {
    return this.http
      .get<AdminCategory[]>(this.base)
      .pipe(map((categories) => categories.map((c) => ({ ...c, imageUrl: toAbsoluteImageUrl(c.imageUrl) }))));
  }

  create(input: CategoryInput): Observable<unknown> {
    return this.http.post(this.base, input);
  }

  update(id: string, input: CategoryInput): Observable<unknown> {
    return this.http.put(`${this.base}/${id}`, input);
  }

  remove(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
