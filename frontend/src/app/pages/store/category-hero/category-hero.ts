import { Component, effect, input, signal } from '@angular/core';
import { StoreCategory } from '../../../shared/data/catalog';

/**
 * Category hero banner (Sample/Store.html's `.category-hero`) — shows the currently
 * selected category's icon + name, updated whenever Store's `?category=` changes.
 *
 * Shows `category().image` (cover-fit) with a dark gradient overlay for text legibility
 * when present, matching the mockup's own photo + `rgba(28,34,42,...)` overlay design;
 * falls back to the flat `--color-ink` → `--color-primary` gradient (category-hero.css)
 * when a category has no photo yet, or its file 404s.
 */
@Component({
  selector: 'app-category-hero',
  templateUrl: './category-hero.html',
  styleUrl: './category-hero.css',
})
export class CategoryHero {
  readonly category = input.required<StoreCategory>();

  protected readonly imageFailed = signal(false);

  constructor() {
    effect(() => {
      this.category();
      this.imageFailed.set(false);
    });
  }

  protected onImageError(): void {
    this.imageFailed.set(true);
  }
}
