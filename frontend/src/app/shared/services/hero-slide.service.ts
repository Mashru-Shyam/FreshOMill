import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';
import { pollCollection } from '../util/load-state';

const REFRESH_INTERVAL_MS = 15_000;

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

  private readonly resource = pollCollection<HeroSlide>(
    () =>
      this.http.get<HeroSlideDto[]>(`${API_BASE_URL}/api/v1/hero-slides`).pipe(
        map((dtos) =>
          dtos
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(
              (dto): HeroSlide => ({
                img: toAbsoluteImageUrl(dto.imageUrl),
                alt: dto.alt,
                icon: dto.icon,
                title: dto.title,
                subtitle: dto.subtitle,
                fallbackGradient: dto.fallbackGradient,
              })
            )
        )
      ),
    REFRESH_INTERVAL_MS
  );

  readonly slides = this.resource.value;
  readonly isLoading = this.resource.isLoading;
}
