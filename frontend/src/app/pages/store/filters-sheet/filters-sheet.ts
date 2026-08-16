import { Component, model } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';

/**
 * Mobile bottom-sheet version of the filter bar (Sample/Store.html's `#filtersSheet`,
 * shown <960px, same cutoff `<app-filters-bar>`'s mobile trigger uses). Same
 * rounded-top/drag-handle/slide-up shape as the shared profile popover's own mobile
 * variant.
 *
 * The mockup opens this against the shared `#drawerBackdrop`, but that backdrop
 * (`shared/backdrop/backdrop.ts`) only reacts to the nav drawer / profile popover's own
 * bottom-sheet state — out of bounds to extend for this page. Instead this owns its own
 * dim+blur overlay, the same self-contained pattern the cart drawer and quick-add modal
 * already use instead of depending on that shared backdrop (see cart-drawer.css's comment).
 *
 * `inStock`/`outOfStock`/`priceMin`/`priceMax`/`open` are all `model()`s shared with
 * `<app-filters-bar>` through the same signals in `store.ts` — editing a value here updates
 * the desktop bar (and the product list) too, and vice versa.
 */
@Component({
  selector: 'app-filters-sheet',
  imports: [Icon],
  templateUrl: './filters-sheet.html',
  styleUrl: './filters-sheet.css',
})
export class FiltersSheet {
  readonly open = model(false);
  readonly inStock = model(false);
  readonly outOfStock = model(false);
  readonly priceMin = model<number | null>(null);
  readonly priceMax = model<number | null>(null);

  protected close(): void {
    this.open.set(false);
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onPriceMinInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.priceMin.set(raw === '' ? null : Number(raw));
  }

  protected onPriceMaxInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.priceMax.set(raw === '' ? null : Number(raw));
  }
}
