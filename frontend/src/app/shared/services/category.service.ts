import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';
import { pollCollection } from '../util/load-state';
import type { StoreCategory } from '../data/catalog';

const REFRESH_INTERVAL_MS = 15_000;

interface CategoryDto {
  readonly slug: string;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly displayOrder: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  private readonly resource = pollCollection<StoreCategory>(
    () =>
      this.http.get<CategoryDto[]>(`${API_BASE_URL}/api/v1/categories`).pipe(
        map((dtos) =>
          dtos
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(
              (dto): StoreCategory => ({
                slug: dto.slug,
                name: dto.name,
                image: toAbsoluteImageUrl(dto.imageUrl),
              })
            )
        )
      ),
    REFRESH_INTERVAL_MS
  );

  readonly categories = this.resource.value;
  readonly isLoading = this.resource.isLoading;
  readonly isError = this.resource.isError;

  reload(): void {
    this.resource.reload();
  }
}
