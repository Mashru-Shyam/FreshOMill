import { Component, ElementRef, HostListener, model, signal } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';

export type SortValue = 'featured' | 'bestselling' | 'az' | 'za' | 'price-low' | 'price-high';

export interface SortOption {
  readonly value: SortValue;
  readonly label: string;
}

/** Same option list/order as Sample/Store.html's `#sortMenu`. */
export const SORT_OPTIONS: SortOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'az', label: 'Alphabetical: A-Z' },
  { value: 'za', label: 'Alphabetical: Z-A' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

/**
 * Custom sort dropdown (Sample/Store.html's `.sort-dropdown`) — a plain button + an
 * absolutely-positioned menu rather than a native `<select>`, whose options panel is
 * entirely OS/browser-styled (no width/position control), matching the mockup's own reason
 * for building this from scratch. `value` is a `model()` so `store.ts` and this component
 * share one signal directly (`[(value)]="sort"`) instead of separate input/output wiring.
 */
@Component({
  selector: 'app-sort-dropdown',
  imports: [Icon],
  templateUrl: './sort-dropdown.html',
  styleUrl: './sort-dropdown.css',
})
export class SortDropdown {
  readonly value = model<SortValue>('featured');

  protected readonly options = SORT_OPTIONS;
  protected readonly menuOpen = signal(false);

  protected readonly selectedLabel = () => this.options.find((o) => o.value === this.value())?.label ?? 'Featured';

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected selectOption(option: SortOption): void {
    this.value.set(option.value);
    this.menuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }
}
