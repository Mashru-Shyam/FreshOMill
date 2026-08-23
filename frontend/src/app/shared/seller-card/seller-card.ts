import { Component, computed, input, signal } from '@angular/core';
import { CartService, slugifyProductId } from '../services/cart.service';
import { OverlayService } from '../services/overlay.service';
import { ProductVariant } from '../data/catalog';
import { Icon } from '../icon/icon';

export interface SellerProduct {
  id?: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
  images?: readonly string[];
  inStock?: boolean;
  description?: string;
  variants?: readonly ProductVariant[];
}

@Component({
  selector: 'app-seller-card',
  imports: [Icon],
  templateUrl: './seller-card.html',
  styleUrl: './seller-card.css',
})
export class SellerCard {
  readonly product = input.required<SellerProduct>();
  readonly showStockBadge = input(false);

  protected readonly productId = computed(() => this.product().id ?? slugifyProductId(this.product().name));
  protected readonly inStock = computed(() => this.product().inStock ?? true);
  protected readonly qty = computed(() => this.cart.productQty(this.productId()));

  protected readonly imageFailed = signal(false);

  constructor(
    private readonly cart: CartService,
    private readonly overlay: OverlayService
  ) {}

  protected onImageError(): void {
    this.imageFailed.set(true);
  }

  private readonly variants = computed<ProductVariant[]>(() => {
    const p = this.product();
    return p.variants?.length ? [...p.variants] : [{ label: p.unit, price: p.price, stockQuantity: 0 }];
  });

  protected openQuickAdd(): void {
    if (!this.inStock()) {
      return;
    }
    const p = this.product();
    this.overlay.openQuickAdd({
      id: this.productId(),
      name: p.name,
      image: p.image,
      images: p.images,
      price: p.price,
      unit: p.unit,
      inStock: this.inStock(),
      description: p.description,
      variants: this.variants(),
    });
  }

  protected increment(): void {
    const p = this.product();
    const id = this.productId();
    const existing = this.cart.lines().find((line) => line.productId === id);
    if (existing) {
      this.cart.setQty(existing.id, existing.qty + 1);
    } else {
      const variant = this.variants()[0];
      this.cart.add({ id, name: p.name, image: p.image }, variant, 1);
    }
  }

  protected decrement(): void {
    const id = this.productId();
    const existing = this.cart.lines().find((line) => line.productId === id);
    if (existing) {
      this.cart.setQty(existing.id, existing.qty - 1);
    }
  }

  protected openCart(): void {
    this.overlay.openCartDrawer();
  }
}
