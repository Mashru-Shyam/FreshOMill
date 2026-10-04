import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';
import { pollCollection } from '../util/load-state';
import type { Testimonial } from '../../pages/home/customer-stories/customer-stories';

interface TestimonialDto {
  readonly initial: string;
  readonly avatarGradient: string;
  readonly name: string;
  readonly text: string;
  readonly videoUrl: string | null;
  readonly displayOrder: number;
}

/** Effectively "fetch once": `pollCollection` needs an interval, and a day is far longer than
 *  any session, so this never actually re-polls. */
const NEVER_REFRESH_MS = 86_400_000;

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private readonly http = inject(HttpClient);

  /** Fetched once (no polling — testimonials aren't time-sensitive the way stock is), but
   *  still tracked so the rail can show placeholders instead of collapsing to zero height. */
  private readonly resource = pollCollection<Testimonial>(
    () =>
      this.http.get<TestimonialDto[]>(`${API_BASE_URL}/api/v1/testimonials`).pipe(
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
                videoUrl: dto.videoUrl ? toAbsoluteImageUrl(dto.videoUrl) : null,
              })
            )
        )
      ),
    NEVER_REFRESH_MS
  );

  readonly testimonials = this.resource.value;
  readonly isLoading = this.resource.isLoading;
}
