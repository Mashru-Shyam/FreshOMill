import { Component, computed, effect, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { OverlayService } from '../services/overlay.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { BuyNowService } from '../services/buy-now.service';
import { Icon } from '../icon/icon';
import type { ProductVariant } from '../data/catalog';

const GENERIC_DESCRIPTION = 'Sourced and prepared with care for everyday freshness and quality.';

@Component({
  selector: 'app-quick-add-modal',
  imports: [Icon],
  templateUrl: './quick-add-modal.html',
  styleUrl: './quick-add-modal.css',
})
export class QuickAddModal {
  protected readonly selectedVariantIndex = signal(0);
  protected readonly selectedImageIndex = signal(0);
  protected readonly qty = signal(1);
  protected readonly imageFailed = signal(false);

  protected readonly images = computed<string[]>(() => {
    const product = this.overlay.quickAddProduct();
    if (!product) {
      return [];
    }
    if (product.images?.length) {
      return [...product.images];
    }
    return product.image ? [product.image] : [];
  });

  protected readonly activeImage = computed(() => this.images()[this.selectedImageIndex()] ?? null);

  protected readonly variants = computed<ProductVariant[]>(() => {
    const product = this.overlay.quickAddProduct();
    return product?.variants.length ? [...product.variants] : [];
  });

  protected readonly stockCount = computed(() => this.selectedVariant()?.stockQuantity ?? 0);

  protected readonly selectedVariant = computed<ProductVariant | null>(
    () => this.variants()[this.selectedVariantIndex()] ?? null
  );

  protected readonly description = computed(() => {
    const product = this.overlay.quickAddProduct();
    if (!product) {
      return '';
    }
    return product.description ?? `${product.name} — ${GENERIC_DESCRIPTION}`;
  });

  protected readonly inCart = computed(() => {
    const product = this.overlay.quickAddProduct();
    const variant = this.selectedVariant();
    if (!product || !variant) {
      return false;
    }
    return this.cart.lineFor(product.id, variant.label) !== undefined;
  });

  constructor(
    protected readonly overlay: OverlayService,
    protected readonly cart: CartService,
    private readonly toast: ToastService,
    private readonly buyNow: BuyNowService,
    private readonly router: Router
  ) {

    effect(() => {
      const product = this.overlay.quickAddProduct();
      if (!product) {
        return;
      }
      this.imageFailed.set(false);
      this.selectedImageIndex.set(0);
      const variants = product.variants;
      const existingLine = untracked(() => this.cart.lines().find((line) => line.productId === product.id));
      if (existingLine) {
        const idx = variants.findIndex((v) => v.label === existingLine.variant);
        this.selectedVariantIndex.set(idx === -1 ? 0 : idx);
        this.qty.set(existingLine.qty);
      } else {
        this.selectedVariantIndex.set(0);
        this.qty.set(1);
      }
    });
  }

  protected onImageError(): void {
    this.imageFailed.set(true);
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
    this.imageFailed.set(false);
  }

  protected selectVariant(index: number): void {
    this.selectedVariantIndex.set(index);
  }

  protected decrementQty(): void {
    this.qty.update((q) => Math.max(1, q - 1));
  }

  protected incrementQty(): void {
    this.qty.update((q) => Math.min(this.stockCount(), q + 1));
  }

  protected close(): void {
    this.overlay.closeQuickAdd();
  }


  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onAddToCart(): void {
    const product = this.overlay.quickAddProduct();
    const variant = this.selectedVariant();
    if (!product || !variant) {
      return;
    }
    const existing = this.cart.lineFor(product.id, variant.label);
    if (existing) {
      this.cart.remove(existing.id);
      this.toast.show(`Removed ${product.name} (${variant.label}) from cart`, 'info');
    } else if (this.cart.add({ id: product.id, name: product.name, image: product.image }, variant, this.qty())) {
      this.toast.show(`Added ${this.qty()} × ${product.name} (${variant.label}) to cart`, 'success');
    }
  }

  protected onBuyNow(): void {
    const product = this.overlay.quickAddProduct();
    const variant = this.selectedVariant();
    if (!product || !variant) {
      return;
    }
    this.buyNow.set({ id: product.id, name: product.name, image: product.image }, variant, this.qty());
    this.overlay.closeQuickAdd();
    this.router.navigateByUrl('/checkout');
  }
}
