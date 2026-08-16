import { Component, ElementRef, HostListener, input, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { INDIAN_STATES } from '../data/states';

/**
 * State picker used by every address-shaped form (Checkout's shipping details, Profile's
 * Basic Information, Profile's Saved Addresses add/edit) — a custom trigger-button + menu,
 * same pattern as Store's `<app-sort-dropdown>` (`shared/state-select` mirrors
 * `pages/store/sort-dropdown` deliberately), rather than a native `<select>` — the native
 * control's options panel is entirely OS/browser-styled with no way to match the rest of
 * the app's dropdowns.
 *
 * Adds keyboard type-ahead on top of the sort-dropdown pattern — deliberately no separate
 * search box: while the menu is open, typing letters buffers them (reset after a short
 * pause, same as a native `<select>`/listbox) and jumps the highlight to the first state
 * whose name starts with that buffer; Enter selects whatever is currently highlighted.
 * Arrow keys move the highlight by one; Escape closes without changing the value.
 *
 * Deliberately `input()`/`output()`, not `model()` — callers here read the current value
 * off a plain signal or a live getter (AccountForm's `defaultAddress`), not always a
 * two-way-bindable signal, so a manual `[value]`/`(valueChange)` pair fits every caller
 * without forcing one shape.
 */
@Component({
  selector: 'app-state-select',
  imports: [Icon],
  templateUrl: './state-select.html',
  styleUrl: './state-select.css',
})
export class StateSelect {
  readonly value = input('');
  readonly invalid = input(false);
  readonly valueChange = output<string>();

  protected readonly states = INDIAN_STATES;
  protected readonly menuOpen = signal(false);
  protected readonly highlightedIndex = signal(-1);

  private typeaheadBuffer = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  protected toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    if (next) {
      this.highlightedIndex.set(Math.max(0, this.states.indexOf(this.value())));
    }
  }

  protected select(state: string): void {
    this.valueChange.emit(state);
    this.menuOpen.set(false);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (!this.menuOpen()) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.toggleMenu();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.menuOpen.set(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveHighlight(-1);
        break;
      case 'Enter': {
        event.preventDefault();
        const state = this.states[this.highlightedIndex()];
        if (state) {
          this.select(state);
        }
        break;
      }
      default:
        // Covers Space too — state names like "Andhra Pradesh" need it as a typeahead
        // character while the menu is open, not a toggle (toggling only happens above,
        // while closed).
        if (event.key.length === 1) {
          this.handleTypeahead(event.key);
        }
    }
  }

  private moveHighlight(delta: number): void {
    const total = this.states.length;
    const current = this.highlightedIndex();
    const next = current === -1 ? (delta > 0 ? 0 : total - 1) : (current + delta + total) % total;
    this.highlightedIndex.set(next);
    this.scrollHighlightedIntoView();
  }

  private handleTypeahead(key: string): void {
    this.typeaheadBuffer += key.toLowerCase();
    clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => (this.typeaheadBuffer = ''), 600);

    const match = this.states.findIndex((s) => s.toLowerCase().startsWith(this.typeaheadBuffer));
    if (match !== -1) {
      this.highlightedIndex.set(match);
      this.scrollHighlightedIntoView();
    }
  }

  private scrollHighlightedIntoView(): void {
    const index = this.highlightedIndex();
    queueMicrotask(() => {
      this.host.nativeElement.querySelectorAll<HTMLElement>('.state-select__option')[index]
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }
}
