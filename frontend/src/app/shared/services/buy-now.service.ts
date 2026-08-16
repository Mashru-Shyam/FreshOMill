import { Injectable, signal } from '@angular/core';
import { CartLine, CartProductInput, CartVariantInput } from './cart.service';

function makeLineId(productId: string, variant: string): string {
  return `${productId}::${variant}`;
}

@Injectable({ providedIn: 'root' })
export class BuyNowService {
  readonly line = signal<CartLine | null>(null);

  set(product: CartProductInput, variant: CartVariantInput, qty: number): void {
    this.line.set({
      id: makeLineId(product.id, variant.label),
      productId: product.id,
      name: product.name,
      image: product.image,
      variant: variant.label,
      unitPrice: variant.price,
      qty,
    });
  }

  setQty(qty: number): void {
    if (qty < 1) {
      this.clear();
      return;
    }
    this.line.update((current) => (current ? { ...current, qty } : current));
  }

  clear(): void {
    this.line.set(null);
  }
}
