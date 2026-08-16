import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../shared/icon/icon';
import { CategoryService } from '../../../shared/services/category.service';

/**
 * "Our Products" category grid (Sample/FreshOMill.html's `.products-grid`,
 * CSS "5. OUR PRODUCTS — CATEGORY GRID"). Links to Store's category filter
 * via a query param, same as the mockup's `Store.html?category=...` anchors.
 *
 * Categories come from `CategoryService` (backend-fetched, shared app-wide) — the single source
 * of truth for category name/image, so this grid and Store's category chips/hero can never drift
 * out of sync with each other. `DisplayOrder` from the database drives which 10 show up front.
 *
 * The mockup ships 10 categories always visible + 5 more revealed by
 * "View All Products" (viewAllProductsBtn/hiddenProducts in the
 * mockup's script — a plain class toggle, no animation). Collapsing swaps
 * the button back to "View All Products" with a chevron-down; expanding
 * shows "Show Less" with a chevron-up — ported here as one `expanded`
 * signal instead of manually swapping innerHTML.
 */
@Component({
  selector: 'app-product-grid',
  imports: [RouterLink, Icon],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class ProductGrid {
  private readonly categoryService = inject(CategoryService);

  protected readonly visibleCategories = computed(() => this.categoryService.categories().slice(0, 10));
  protected readonly hiddenCategories = computed(() => this.categoryService.categories().slice(10));

  protected readonly expanded = signal(false);
  protected readonly failedImages = signal<Set<string>>(new Set());

  protected toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }

  protected onImageError(slug: string): void {
    const next = new Set(this.failedImages());
    next.add(slug);
    this.failedImages.set(next);
  }
}
