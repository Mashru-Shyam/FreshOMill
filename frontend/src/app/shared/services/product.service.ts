import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';
import { pollCollection } from '../util/load-state';
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

  /** Same endpoint, same polling cadence, same mapping as before — `pollCollection` only adds
   *  the loading/error tracking the grids need to stop rendering "no results" during a cold
   *  load. See shared/util/load-state.ts. */
  private readonly resource = pollCollection<StoreProduct>(
    () =>
      this.http.get<ProductDto[]>(`${API_BASE_URL}/api/v1/products`).pipe(
        map((dtos) =>
          dtos.map(
            (dto): StoreProduct => ({
              id: dto.slug,
              name: dto.name,
              price: dto.price,
              unit: dto.unit,
              categorySlug: dto.categorySlug,
              image: toAbsoluteImageUrl(dto.imageUrl),
              inStock: dto.inStock,
              description: dto.description,
              popularity: dto.popularity,
              isFeatured: dto.isFeatured,
              variants: dto.variants.map((v) => ({ label: v.label, price: v.price, stockQuantity: v.stockQuantity })),
              images: dto.images.map((url) => toAbsoluteImageUrl(url)),
            })
          )
        )
      ),
    REFRESH_INTERVAL_MS
  );

  readonly products = this.resource.value;
  readonly isLoading = this.resource.isLoading;
  readonly isError = this.resource.isError;

  reload(): void {
    this.resource.reload();
  }
}
