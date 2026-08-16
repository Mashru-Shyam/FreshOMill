import { Component, input, output } from '@angular/core';
import { SellerCard, SellerProduct } from '../../../shared/seller-card/seller-card';
import { Icon } from '../../../shared/icon/icon';
import { StoreProduct } from '../../../shared/data/catalog';

/**
 * Store's own product grid (Sample/Store.html's `.product-grid` — a wrapping CSS grid, not
 * a slider, since this page browses a full category/catalog rather than a curated row).
 * Distinct from `pages/home/product-grid` (that one is Home's *category* grid); this one
 * lays out `<app-seller-card>` per product, reusing the exact same shared card Home's Best
 * Sellers uses. Shows `.product-grid__empty` when the current filter/search combination
 * matches nothing (Sample/Store.html's `#emptyClearFiltersBtn` state).
 */
@Component({
  selector: 'app-store-product-grid',
  imports: [SellerCard, Icon],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class StoreProductGrid {
  readonly products = input<StoreProduct[]>([]);
  readonly clearFilters = output<void>();

  protected toSellerProduct(product: StoreProduct): SellerProduct {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
      inStock: product.inStock,
      description: product.description,
      variants: product.variants,
    };
  }
}
