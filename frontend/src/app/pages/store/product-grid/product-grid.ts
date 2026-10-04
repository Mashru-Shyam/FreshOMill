import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SellerCard, SellerProduct } from '../../../shared/seller-card/seller-card';
import { ProductCardSkeleton } from '../../../shared/skeletons/product-card-skeleton';
import { Icon } from '../../../shared/icon/icon';
import { StoreProduct } from '../../../shared/data/catalog';

/**
 * Store's own product grid (Sample/Store.html's `.product-grid` — a wrapping CSS grid, not
 * a slider, since this page browses a full category/catalog rather than a curated row).
 * Distinct from `pages/home/product-grid` (that one is Home's *category* grid); this one
 * lays out `<app-seller-card>` per product, reusing the exact same shared card Home's Best
 * Sellers uses.
 *
 * Four states, which the grid used to collapse into one. Previously any empty `products`
 * array — first paint, dead API, over-tight filters, genuinely empty category — rendered
 * "No products match these filters. [Clear filters]". That message was wrong in three of
 * those four cases, and the offered recovery ("clear filters") did nothing in all three.
 *
 *  - loading → skeleton cards, so the page has the shape of a catalogue while it loads;
 *  - error   → what went wrong plus a Retry that refetches;
 *  - empty because of filters → the original message and Clear filters;
 *  - empty category → says the category is empty and points back to the full catalogue.
 */
@Component({
  selector: 'app-store-product-grid',
  imports: [RouterLink, SellerCard, ProductCardSkeleton, Icon],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class StoreProductGrid {
  readonly products = input<StoreProduct[]>([]);
  readonly loading = input(false);
  readonly failed = input(false);
  /** Whether any availability/price filter is currently narrowing the list — decides which
   *  of the two empty states (and which recovery action) is the honest one to show. */
  readonly filtersActive = input(false);

  /** Two full rows at the widest (5-column) breakpoint — enough to fill the fold without
   *  painting placeholders far below it. */
  protected readonly skeletonSlots = Array.from({ length: 10 }, (_, i) => i);

  readonly clearFilters = output<void>();
  readonly retry = output<void>();

  protected toSellerProduct(product: StoreProduct): SellerProduct {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
      images: product.images,
      inStock: product.inStock,
      description: product.description,
      variants: product.variants,
    };
  }
}
