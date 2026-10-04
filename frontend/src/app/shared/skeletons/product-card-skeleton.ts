import { Component } from '@angular/core';

/**
 * Placeholder for one `<app-seller-card>` while the catalogue request is in flight.
 *
 * Deliberately mirrors the real card's geometry — same border, radius, elevation, the same
 * `1 / 0.85` image ratio, and the same `:host` flex basis so it occupies exactly one slot in
 * the Best Sellers rail as well as one cell in the Store grid. A skeleton that's a different
 * size than the thing it stands in for is worse than no skeleton: the layout jumps the moment
 * the data lands.
 *
 * One instance renders one card; callers loop. Keeping the count outside means each caller
 * decides how many placeholders its own viewport can show.
 */
@Component({
  selector: 'app-product-card-skeleton',
  template: `
    <div class="sk-card" aria-hidden="true">
      <div class="sk-card__image">
        <div class="skeleton sk-card__image-fill"></div>
      </div>
      <div class="sk-card__body">
        <div class="skeleton skeleton--title sk-card__name"></div>
        <div class="skeleton skeleton--text sk-card__price"></div>
      </div>
    </div>
  `,
  styles: `
    /* Mirrors seller-card.css's own :host block so a placeholder and a real card take the
       same slot in both layouts that use them. */
    :host {
      display: block;
      min-width: 0;
      flex: 0 0 calc((100% - 4 * var(--space-lg)) / 5);
    }

    @media (max-width: 960px) {
      :host {
        flex-basis: calc((100% - 2 * var(--space-md)) / 3);
      }
    }

    @media (max-width: 639px) {
      :host {
        flex-basis: calc((100% - 1 * var(--space-sm)) / 2);
      }
    }

    .sk-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-surface);
      border: 1px solid var(--color-hairline);
      border-radius: var(--rounded-lg);
      overflow: hidden;
      box-shadow: var(--elevation-raised);
    }

    .sk-card__image {
      width: 100%;
      aspect-ratio: 1 / 1.02;
      background: var(--color-surface-sunken);
    }

    .sk-card__image-fill {
      width: 100%;
      height: 100%;
      border-radius: 0;
    }

    .sk-card__body {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      padding: var(--space-sm) var(--space-md) var(--space-md);
      border-top: 1px solid var(--color-hairline);
      margin-top: auto;
    }

    .sk-card__name {
      width: 80%;
    }

    .sk-card__price {
      width: 45%;
    }
  `,
})
export class ProductCardSkeleton {}
