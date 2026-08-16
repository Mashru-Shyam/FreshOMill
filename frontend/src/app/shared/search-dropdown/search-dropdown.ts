import { Component, computed, inject, input, output, signal } from '@angular/core';
import { OverlayService } from '../services/overlay.service';
import { ProductService } from '../services/product.service';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-search-dropdown',
  imports: [Icon],
  templateUrl: './search-dropdown.html',
  styleUrl: './search-dropdown.css',
})
export class SearchDropdown {
  readonly open = input(false);
  readonly query = input('');
  readonly variant = input<'compact' | 'full'>('full');
  readonly productSelected = output<void>();

  private readonly productService = inject(ProductService);

  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    const products = this.productService.products();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  });

  protected readonly resultsLabel = computed(() => {
    const q = this.query().trim();
    if (!q) {
      return 'All Products';
    }
    const count = this.results().length;
    return `${count} result${count === 1 ? '' : 's'} for "${q}"`;
  });

  protected readonly failedImages = signal<Set<string>>(new Set());

  constructor(private readonly overlay: OverlayService) {}

  protected onImageError(productId: string): void {
    const next = new Set(this.failedImages());
    next.add(productId);
    this.failedImages.set(next);
  }

  protected selectProduct(productId: string): void {
    const product = this.results().find((p) => p.id === productId);
    if (!product) {
      return;
    }
    this.overlay.openQuickAdd({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      unit: product.unit,
      inStock: product.inStock,
      description: product.description,
      variants: product.variants,
    });
    this.productSelected.emit();
  }
}
