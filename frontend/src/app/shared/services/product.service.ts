import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, shareReplay, switchMap, timer } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import type { StoreProduct } from '../data/catalog';

const REFRESH_INTERVAL_MS = 15_000;

interface ProductVariantDto {
  readonly label: string;
  readonly price: number;
  readonly stockQuantity: number;
}

interface ProductDto {
  readonly slug: string;
  readonly name: string;
  readonly price: number;
  readonly unit: string;
  readonly categorySlug: string;
  readonly imageUrl: string | null;
  readonly inStock: boolean;
  readonly description: string;
  readonly popularity: number;
  readonly isFeatured: boolean;
  readonly variants: readonly ProductVariantDto[];
  readonly images: readonly string[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly products$ = timer(0, REFRESH_INTERVAL_MS).pipe(
    switchMap(() => this.http.get<ProductDto[]>(`${API_BASE_URL}/api/v1/products`)),
    map((dtos) =>
      dtos.map(
        (dto): StoreProduct => ({
          id: dto.slug,
          name: dto.name,
          price: dto.price,
          unit: dto.unit,
          categorySlug: dto.categorySlug,
          image: dto.imageUrl ? `${API_BASE_URL}${dto.imageUrl}` : '',
          inStock: dto.inStock,
          description: dto.description,
          popularity: dto.popularity,
          isFeatured: dto.isFeatured,
          variants: dto.variants.map((v) => ({ label: v.label, price: v.price, stockQuantity: v.stockQuantity })),
          images: dto.images.map((url) => `${API_BASE_URL}${url}`),
        })
      )
    ),
    catchError(() => of<StoreProduct[]>([])),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  readonly products = toSignal(this.products$, { initialValue: [] as StoreProduct[] });
}
