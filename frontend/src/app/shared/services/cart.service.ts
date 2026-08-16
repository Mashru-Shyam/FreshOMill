import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { extractErrorMessage } from '../util/http-error';
import { AuthService } from './auth.service';
import { OverlayService } from './overlay.service';
import { ToastService } from './toast.service';

export interface CartLine {
  readonly id: string;
  readonly productId: string;
  readonly name: string;
  readonly image?: string;
  readonly variant: string;
  readonly unitPrice: number;
  readonly qty: number;
}

export interface CartProductInput {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
}

export interface CartVariantInput {
  readonly label: string;
  readonly price: number;
}

interface CartLineDto {
  readonly id: string;
  readonly productSlug: string | null;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly variant: string;
  readonly unitPrice: number;
  readonly qty: number;
}

interface CartDto {
  readonly lines: readonly CartLineDto[];
  readonly subtotal: number;
}

export function slugifyProductId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly overlay = inject(OverlayService);
  private readonly toast = inject(ToastService);

  private readonly refreshTrigger = signal(0);

  private readonly cart$ = toObservable(
    computed(() => ({ signedIn: this.auth.isLoggedIn(), tick: this.refreshTrigger() }))
  ).pipe(
    switchMap(({ signedIn }) =>
      signedIn
        ? this.http.get<CartDto>(`${API_BASE_URL}/api/v1/cart`).pipe(
            map((dto) => dto.lines.map(fromDto)),
            catchError(() => of<CartLine[]>([]))
          )
        : of<CartLine[]>([])
    )
  );

  readonly lines = toSignal(this.cart$, { initialValue: [] as CartLine[] });

  readonly lineCount = computed(() => this.lines().reduce((sum, line) => sum + line.qty, 0));

  readonly subtotal = computed(() => this.lines().reduce((sum, line) => sum + line.unitPrice * line.qty, 0));

  productQty(productId: string): number {
    return this.lines()
      .filter((line) => line.productId === productId)
      .reduce((sum, line) => sum + line.qty, 0);
  }

  lineFor(productId: string, variant: string): CartLine | undefined {
    return this.lines().find((line) => line.productId === productId && line.variant === variant);
  }

  add(product: CartProductInput, variant: CartVariantInput, qty: number): boolean {
    if (qty < 1) {
      return false;
    }
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please sign in to add items to your cart.', 'info');
      this.overlay.openProfile(null);
      return false;
    }

    this.http
      .post<CartDto>(`${API_BASE_URL}/api/v1/cart/lines`, {
        productSlug: product.id,
        name: product.name,
        imageUrl: product.image ?? null,
        variant: variant.label,
        unitPrice: variant.price,
        qty,
      })
      .subscribe({
        next: () => this.refetch(),
        error: (error: unknown) => this.toast.show(extractErrorMessage(error) ?? 'Could not add item to cart.', 'error'),
      });
    return true;
  }

  setQty(lineId: string, qty: number): void {
    if (qty < 1) {
      this.remove(lineId);
      return;
    }
    this.http.put<CartDto>(`${API_BASE_URL}/api/v1/cart/lines/${lineId}`, { qty }).subscribe({
      next: () => this.refetch(),
      error: (error: unknown) => this.toast.show(extractErrorMessage(error) ?? 'Could not update quantity.', 'error'),
    });
  }

  remove(lineId: string): void {
    this.http.delete<CartDto>(`${API_BASE_URL}/api/v1/cart/lines/${lineId}`).subscribe({
      next: () => this.refetch(),
      error: (error: unknown) => this.toast.show(extractErrorMessage(error) ?? 'Could not remove item.', 'error'),
    });
  }

  clear(): void {
    this.http.delete(`${API_BASE_URL}/api/v1/cart`).subscribe({
      next: () => this.refetch(),
      error: (error: unknown) => this.toast.show(extractErrorMessage(error) ?? 'Could not clear cart.', 'error'),
    });
  }

  refetch(): void {
    this.refreshTrigger.update((n) => n + 1);
  }
}

function fromDto(dto: CartLineDto): CartLine {
  return {
    id: dto.id,
    productId: dto.productSlug ?? '',
    name: dto.name,
    image: dto.imageUrl ?? undefined,
    variant: dto.variant,
    unitPrice: dto.unitPrice,
    qty: dto.qty,
  };
}
