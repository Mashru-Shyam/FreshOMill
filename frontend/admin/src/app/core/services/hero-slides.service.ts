import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';

export interface AdminHeroSlide {
  id: string;
  imageUrl: string | null;
  alt: string;
  icon: string;
  title: string;
  subtitle: string;
  fallbackGradient: string;
  displayOrder: number;
}

export interface HeroSlideInput {
  imageUrl: string | null;
  alt: string;
  icon: string;
  title: string;
  subtitle: string;
  fallbackGradient: string;
  displayOrder: number;
}

@Injectable({ providedIn: 'root' })
export class HeroSlidesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/api/v1/admin/hero-slides`;

  list(): Observable<AdminHeroSlide[]> {
    return this.http
      .get<AdminHeroSlide[]>(this.base)
      .pipe(map((slides) => slides.map((s) => ({ ...s, imageUrl: toAbsoluteImageUrl(s.imageUrl) }))));
  }

  create(input: HeroSlideInput): Observable<unknown> {
    return this.http.post(this.base, input);
  }

  update(id: string, input: HeroSlideInput): Observable<unknown> {
    return this.http.put(`${this.base}/${id}`, input);
  }

  remove(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
