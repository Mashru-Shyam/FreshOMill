import { Component, input, output } from '@angular/core';

/**
 * Placeholder rows shown while a table's first request is in flight.
 *
 * Every admin screen used to render the literal string "Loading…" as a centred grey
 * paragraph, which collapsed the card to one line and then jumped to full height when the
 * data landed. These hold roughly the table's shape instead.
 */
@Component({
  selector: 'app-table-skeleton',
  template: `
    <div class="skeleton-rows" aria-hidden="true">
      @for (row of rows(); track row) {
        <div class="skeleton-rows__row">
          <div class="skeleton skeleton-rows__thumb"></div>
          <div class="skeleton skeleton-rows__cell"></div>
          <div class="skeleton skeleton-rows__cell"></div>
          <div class="skeleton skeleton-rows__cell"></div>
          <div class="skeleton skeleton-rows__cell"></div>
        </div>
      }
    </div>
    <span class="sr-only" role="status">Loading…</span>
  `,
})
export class TableSkeleton {
  readonly count = input(5);

  protected rows(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}

/**
 * The "nothing to show" block, in its three flavours: an empty collection, a filter that
 * matched nothing, and a request that failed.
 *
 * The failure case is the one that mattered most: an error used to render as a static red
 * banner with no way to try again, so the only recovery an operator had was a full page
 * reload.
 */
@Component({
  selector: 'app-empty-state',
  template: `
    <div
      class="empty-state"
      [class.empty-state--error]="variant() === 'error'"
      [attr.role]="variant() === 'error' ? 'alert' : null"
    >
      <svg
        class="empty-state__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        width="28"
        height="28"
        aria-hidden="true"
      >
        @switch (variant()) {
          @case ('error') {
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          }
          @case ('filtered') {
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.34-4.34" />
            <path d="m13.5 8.5-5 5" />
            <path d="m8.5 8.5 5 5" />
          }
          @default {
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          }
        }
      </svg>
      <p class="empty-state__title">{{ title() }}</p>
      @if (text()) {
        <p class="empty-state__text">{{ text() }}</p>
      }
      @if (actionLabel()) {
        <button
          type="button"
          class="btn empty-state__cta"
          [class.btn--primary]="variant() === 'error'"
          [class.btn--secondary]="variant() !== 'error'"
          (click)="action.emit()"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyState {
  readonly variant = input<'empty' | 'filtered' | 'error'>('empty');
  readonly title = input.required<string>();
  readonly text = input('');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
