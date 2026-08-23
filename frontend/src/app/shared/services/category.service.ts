import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, shareReplay, switchMap, timer } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
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

  private readonly categories$ = timer(0, REFRESH_INTERVAL_MS).pipe(
    switchMap(() => this.http.get<CategoryDto[]>(`${API_BASE_URL}/api/v1/categories`)),
    map((dtos) =>
      dtos
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(
          (dto): StoreCategory => ({
            slug: dto.slug,
            name: dto.name,
            image: dto.imageUrl ? `${API_BASE_URL}${dto.imageUrl}` : '',
          })
        )
    ),
    catchError(() => of<StoreCategory[]>([])),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  readonly categories = toSignal(this.categories$, { initialValue: [] as StoreCategory[] });
}
