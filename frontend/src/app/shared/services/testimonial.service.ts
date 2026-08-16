import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, shareReplay } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import type { Testimonial } from '../../pages/home/customer-stories/customer-stories';

interface TestimonialDto {
  readonly initial: string;
  readonly avatarGradient: string;
  readonly name: string;
  readonly text: string;
  readonly displayOrder: number;
}

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private readonly http = inject(HttpClient);

  private readonly testimonials$ = this.http.get<TestimonialDto[]>(`${API_BASE_URL}/api/v1/testimonials`).pipe(
    map((dtos) =>
      dtos
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(
          (dto): Testimonial => ({
            initial: dto.initial,
            avatarGradient: dto.avatarGradient,
            name: dto.name,
            text: dto.text,
          })
        )
    ),
    catchError(() => of<Testimonial[]>([])),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  readonly testimonials = toSignal(this.testimonials$, { initialValue: [] as Testimonial[] });
}
