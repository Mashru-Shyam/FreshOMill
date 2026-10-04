import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../shared/services/category.service';
import { Icon } from '../../../shared/icon/icon';

/**
 * "Our Products" category grid (Sample/FreshOMill.html's `.products-grid`,
 * CSS "5. OUR PRODUCTS — CATEGORY GRID"). Links to Store's category filter
 * via a query param, same as the mockup's `Store.html?category=...` anchors.
 *
 * Categories come from `CategoryService` (backend-fetched, shared app-wide) — the single source
 * of truth for category name/image, so this grid and Store's category chips/hero can never drift
 * out of sync with each other.
 *
 * Every category renders at once, ordered by DisplayOrder. The mockup's "View All Products"
 * toggle (10 visible + the rest behind a expand/collapse button) is gone: the catalog is
 * admin-managed now, so the count isn't fixed at 15, and hiding categories behind a click just
 * cost a shopper a step on the way to browsing.
 */
@Component({
  selector: 'app-product-grid',
  imports: [RouterLink, Icon],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class ProductGrid {
  private readonly categoryService = inject(CategoryService);

  protected readonly categories = this.categoryService.categories;
  /** A cold load used to render the "Our Products" heading over an empty page. Placeholder
   *  tiles keep the section the right shape until the real categories arrive. */
  protected readonly loading = this.categoryService.isLoading;
  protected readonly failed = this.categoryService.isError;

  protected retry(): void {
    this.categoryService.reload();
  }

  /** One full row at the widest breakpoint. */
  protected readonly skeletonSlots = Array.from({ length: 12 }, (_, i) => i);

  protected readonly failedImages = signal<Set<string>>(new Set());

  protected onImageError(slug: string): void {
    const next = new Set(this.failedImages());
    next.add(slug);
    this.failedImages.set(next);
  }
}
