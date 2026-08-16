import { Component, computed, input, model } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';
import { AppliedFilterChip, FilterChips } from '../filter-chips/filter-chips';
import { SortDropdown, SortValue } from '../sort-dropdown/sort-dropdown';

/**
 * Desktop filter + sort toolbar (Sample/Store.html's `.store-filters` section) — checkbox
 * availability filters, a price-range pair, the result count, the sort dropdown, and the
 * applied-filter chip row all in one bar. Below 960px this collapses to just the "Filters"
 * trigger button (opens `<app-filters-sheet>`, a sibling this component doesn't render
 * itself — `store.ts` mounts both, sharing state through the same `model()` signals passed
 * to each) — pure CSS, same breakpoint `product-grid.css`/`seller-card.css` already use for
 * their own tablet cutoff.
 *
 * `inStock`/`outOfStock`/`priceMin`/`priceMax`/`sort`/`sheetOpen` are all `model()`s so
 * `store.ts` and `<app-filters-sheet>` share the exact same signals this component writes
 * to — one source of truth driving the product list's filtering/sorting.
 */
@Component({
  selector: 'app-filters-bar',
  imports: [SortDropdown, FilterChips, Icon],
  templateUrl: './filters-bar.html',
  styleUrl: './filters-bar.css',
})
export class FiltersBar {
  readonly inStock = model(false);
  readonly outOfStock = model(false);
  readonly priceMin = model<number | null>(null);
  readonly priceMax = model<number | null>(null);
  readonly sort = model<SortValue>('featured');
  readonly sheetOpen = model(false);

  readonly resultCount = input(0);

  protected readonly appliedChips = computed<AppliedFilterChip[]>(() => {
    const chips: AppliedFilterChip[] = [];
    if (this.inStock() && !this.outOfStock()) chips.push({ key: 'inStock', label: 'In Stock' });
    if (this.outOfStock() && !this.inStock()) chips.push({ key: 'outOfStock', label: 'Out of Stock' });
    if (this.priceMin() !== null) chips.push({ key: 'priceMin', label: `Min Rs. ${this.priceMin()}` });
    if (this.priceMax() !== null) chips.push({ key: 'priceMax', label: `Max Rs. ${this.priceMax()}` });
    return chips;
  });

  protected onPriceMinInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.priceMin.set(raw === '' ? null : Number(raw));
  }

  protected onPriceMaxInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.priceMax.set(raw === '' ? null : Number(raw));
  }

  protected removeFilter(key: string): void {
    if (key === 'priceMin' || key === 'priceMax') {
      this[key].set(null);
    } else {
      this[key as 'inStock' | 'outOfStock'].set(false);
    }
  }

  protected clearAllFilters(): void {
    this.inStock.set(false);
    this.outOfStock.set(false);
    this.priceMin.set(null);
    this.priceMax.set(null);
  }
}
