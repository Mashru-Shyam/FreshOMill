import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, shareReplay, switchMap, timer } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';

const REFRESH_INTERVAL_MS = 15_000;

interface AllProductsImageDto {
  readonly imageUrl: string | null;
}

/** Image for the synthetic "All Products" category chip/filter (see shared/data/catalog.ts's
 *  ALL_CATEGORY) — admin-managed from its own Categories screen row, independent of the real
 *  Category table. */
@Injectable({ providedIn: 'root' })
export class AllProductsImageService {
  private readonly http = inject(HttpClient);

  private readonly image$ = timer(0, REFRESH_INTERVAL_MS).pipe(
    switchMap(() => this.http.get<AllProductsImageDto>(`${API_BASE_URL}/api/v1/all-products-image`)),
    map((dto) => toAbsoluteImageUrl(dto.imageUrl)),
    catchError(() => of('')),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  readonly image = toSignal(this.image$, { initialValue: '' });
}
