import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, shareReplay } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface HeroSlide {
  readonly img: string;
  readonly alt: string;
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly fallbackGradient: string;
}

interface HeroSlideDto {
  readonly imageUrl: string | null;
  readonly alt: string;
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly fallbackGradient: string;
  readonly displayOrder: number;
}

@Injectable({ providedIn: 'root' })
export class HeroSlideService {
  private readonly http = inject(HttpClient);

  private readonly slides$ = this.http.get<HeroSlideDto[]>(`${API_BASE_URL}/api/v1/hero-slides`).pipe(
    map((dtos) =>
      dtos
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(
          (dto): HeroSlide => ({
            img: dto.imageUrl ? `${API_BASE_URL}${dto.imageUrl}` : '',
            alt: dto.alt,
            icon: dto.icon,
            title: dto.title,
            subtitle: dto.subtitle,
            fallbackGradient: dto.fallbackGradient,
          })
        )
    ),
    catchError(() => of<HeroSlide[]>([])),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  readonly slides = toSignal(this.slides$, { initialValue: [] as HeroSlide[] });
}
