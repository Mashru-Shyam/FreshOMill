import { Component, computed, model } from '@angular/core';

/**
 * The actual filter controls — availability and price range — as one vertical
 * panel.
 *
 * Rendered twice, from one definition: as the Store page's sticky desktop rail,
 * and as the body of the mobile filters bottom sheet. Before this the same
 * checkboxes and the same price pair were written out in full in *both*
 * `filters-bar.html` and `filters-sheet.html`, so every change to a filter had
 * to be made twice and the two drifted (the bar's price inputs had a hover
 * state, the sheet's didn't).
 *
 * Every value is a `model()`, so both instances and `store.ts` read and write
 * the same signals — the filtering logic itself is untouched and still lives
 * in `store.ts`'s `filteredProducts` computed.
 */
@Component({
  selector: 'app-filters-panel',
  templateUrl: './filters-panel.html',
  styleUrl: './filters-panel.css',
})
export class FiltersPanel {
  readonly inStock = model(false);
  readonly outOfStock = model(false);
  readonly priceMin = model<number | null>(null);
  readonly priceMax = model<number | null>(null);

  protected readonly anyActive = computed(
    () => this.inStock() || this.outOfStock() || this.priceMin() !== null || this.priceMax() !== null
  );

  protected onPriceMinInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.priceMin.set(raw === '' ? null : Number(raw));
  }

  protected onPriceMaxInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.priceMax.set(raw === '' ? null : Number(raw));
  }

  protected clearAll(): void {
    this.inStock.set(false);
    this.outOfStock.set(false);
    this.priceMin.set(null);
    this.priceMax.set(null);
  }
}
