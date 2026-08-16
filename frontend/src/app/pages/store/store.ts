import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { CategoryChips } from './category-chips/category-chips';
import { CategoryHero } from './category-hero/category-hero';
import { ALL_CATEGORY, StoreCategory } from '../../shared/data/catalog';
import { CategoryService } from '../../shared/services/category.service';
import { ProductService } from '../../shared/services/product.service';
import { FiltersBar } from './filters-bar/filters-bar';
import { FiltersSheet } from './filters-sheet/filters-sheet';
import { StoreProductGrid } from './product-grid/product-grid';
import { SortValue } from './sort-dropdown/sort-dropdown';

/**
 * Store page (Sample/Store.html) — category hero banner, the category chip rail, the
 * filter/sort toolbar (desktop bar + mobile bottom sheet sharing one set of signals), and
 * the product grid, all composed here. Everything above/below this (ticker, navbar,
 * search, profile popover, drawers, footer, WhatsApp button, cart drawer, quick-add modal,
 * toast) is the shared shell (`shared/shell/`) and isn't touched by this page.
 *
 * The selected category is read from `?category=` (Home's category cards link here as
 * `/store?category=<slug>`) and is the *only* piece of state kept in the URL — clicking a
 * category chip navigates (via `Router.navigate` with `queryParamsHandling: 'merge'`)
 * rather than mutating a local signal directly, so the category stays bookmarkable/
 * shareable and back-button-friendly, exactly like the mockup's own `?category=` anchors.
 * Availability/price/sort/search filters are plain component state (mirrors the mockup's
 * own in-memory `filterState`/`currentSort`, never URL-synced there either).
 */
@Component({
  selector: 'app-store-page',
  imports: [CategoryHero, CategoryChips, FiltersBar, FiltersSheet, StoreProductGrid],
  templateUrl: './store.html',
})
export class Store {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);

  private readonly categorySlug = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('category') ?? 'all')),
    { initialValue: 'all' }
  );

  private readonly allCategories = computed<StoreCategory[]>(() => [ALL_CATEGORY, ...this.categoryService.categories()]);

  protected readonly activeCategory = computed(
    () => this.allCategories().find((c) => c.slug === this.categorySlug()) ?? ALL_CATEGORY
  );

  protected readonly inStock = signal(false);
  protected readonly outOfStock = signal(false);
  protected readonly priceMin = signal<number | null>(null);
  protected readonly priceMax = signal<number | null>(null);
  protected readonly sort = signal<SortValue>('featured');
  protected readonly filtersSheetOpen = signal(false);

  protected readonly filteredProducts = computed(() => {
    const categorySlug = this.categorySlug();
    const inStock = this.inStock();
    const outOfStock = this.outOfStock();
    const priceMin = this.priceMin();
    const priceMax = this.priceMax();

    const allProducts = this.productService.products();
    let list = categorySlug === 'all' ? allProducts : allProducts.filter((p) => p.categorySlug === categorySlug);

    if (inStock && !outOfStock) list = list.filter((p) => p.inStock);
    if (outOfStock && !inStock) list = list.filter((p) => !p.inStock);
    if (priceMin !== null) list = list.filter((p) => p.price >= priceMin);
    if (priceMax !== null) list = list.filter((p) => p.price <= priceMax);

    const sorted = list.slice();
    switch (this.sort()) {
      case 'bestselling':
        sorted.sort((a, b) => a.popularity - b.popularity);
        break;
      case 'az':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      // 'featured' (default): keep the authored catalog order
    }
    return sorted;
  });

  protected selectCategory(slug: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: slug },
      queryParamsHandling: 'merge',
    });
  }

  protected clearAllFilters(): void {
    this.inStock.set(false);
    this.outOfStock.set(false);
    this.priceMin.set(null);
    this.priceMax.set(null);
  }
}
