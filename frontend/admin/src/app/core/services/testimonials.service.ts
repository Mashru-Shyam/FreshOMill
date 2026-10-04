import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';

export interface AdminTestimonial {
  id: string;
  /** Derived server-side from the name — not editable here, shown only as the avatar letter. */
  initial: string;
  avatarGradient: string;
  name: string;
  text: string;
  videoUrl: string | null;
  displayOrder: number;
}

export interface TestimonialInput {
  name: string;
  text: string;
  videoUrl: string | null;
  displayOrder: number;
}

@Injectable({ providedIn: 'root' })
export class TestimonialsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/api/v1/admin/testimonials`;

  list(): Observable<AdminTestimonial[]> {
    return this.http
      .get<AdminTestimonial[]>(this.base)
      .pipe(map((stories) => stories.map((s) => ({ ...s, videoUrl: toAbsoluteImageUrl(s.videoUrl) }))));
  }

  create(input: TestimonialInput): Observable<unknown> {
    return this.http.post(this.base, input);
  }

  update(id: string, input: TestimonialInput): Observable<unknown> {
    return this.http.put(`${this.base}/${id}`, input);
  }

  remove(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
