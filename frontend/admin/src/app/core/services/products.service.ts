import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { toAbsoluteImageUrl } from '../util/image-url';

export interface AdminProductVariant {
  id: string;
  label: string;
  price: number;
  stockQuantity: number;
  sortOrder: number;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  unit: string;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  inStock: boolean;
  description: string;
  popularity: number;
  isFeatured: boolean;
  variants: AdminProductVariant[];
  /** Full ordered gallery — images[0] is always the same photo as imageUrl. */
  images: string[];
}

/** `id: null` means "add this as a new variant"; a populated id edits that existing row. Any
 * existing variant not included in the array is deleted — see UpdateProductCommand on the
 * backend for the exact replace-all-variants semantics this maps onto. */
export interface ProductVariantInput {
  id: string | null;
  label: string;
  price: number;
  stockQuantity: number;
  sortOrder: number;
}

export interface ProductInput {
  name: string;
  price: number;
  unit: string;
  categoryId: string;
  description: string;
  popularity: number;
  isFeatured: boolean;
  variants: ProductVariantInput[];
  /** Full ordered gallery to save — imageUrls[0] becomes the product's primary image. */
  imageUrls: string[];
}

/** The backend returns image paths relative to itself — see toAbsoluteImageUrl's own doc comment
 *  for why every response here needs this before it's usable as an <img src>. */
function withAbsoluteImages(product: AdminProduct): AdminProduct {
  return {
    ...product,
    imageUrl: toAbsoluteImageUrl(product.imageUrl),
    images: product.images.map((url) => toAbsoluteImageUrl(url)!),
  };
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/api/v1/admin/products`;

  list(): Observable<AdminProduct[]> {
    return this.http.get<AdminProduct[]>(this.base).pipe(map((products) => products.map(withAbsoluteImages)));
  }

  create(input: ProductInput): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(this.base, input).pipe(map(withAbsoluteImages));
  }

  update(id: string, input: ProductInput): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(`${this.base}/${id}`, input).pipe(map(withAbsoluteImages));
  }

  remove(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }

  adjustStock(variantId: string, newQuantity: number, reason: string): Observable<AdminProduct> {
    return this.http
      .post<AdminProduct>(`${this.base}/variants/${variantId}/stock`, { newQuantity, reason })
      .pipe(map(withAbsoluteImages));
  }
}
