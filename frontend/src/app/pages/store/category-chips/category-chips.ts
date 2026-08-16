import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Icon } from '../../../shared/icon/icon';
import { ALL_CATEGORY, StoreCategory } from '../../../shared/data/catalog';
import { CategoryService } from '../../../shared/services/category.service';

/**
 * Category selector — horizontal chip slider (Sample/Store.html's
 * `.category-selector-slider` / `.category-chip`) letting the shopper switch category from
 * within Store itself. Drag/arrow/scroll-snap mechanics ported 1:1 from the same pattern
 * `pages/home/best-sellers/best-sellers.ts` already uses for its own slider (arrows hide at
 * the ends, pointer-drag past a 5px threshold, click-suppression after a drag) — chips here
 * are plain `<button>`s instead of the mockup's `<a href="Store.html?category=...">` anchors
 * since selecting a category updates Store's own state/query param in place rather than
 * navigating to a new page.
 */
@Component({
  selector: 'app-category-chips',
  imports: [Icon],
  templateUrl: './category-chips.html',
  styleUrl: './category-chips.css',
})
export class CategoryChips {
  readonly activeSlug = input.required<string>();
  readonly categorySelected = output<string>();

  @ViewChild('slider') private readonly sliderRef!: ElementRef<HTMLDivElement>;

  private readonly categoryService = inject(CategoryService);

  protected readonly chips = computed<StoreCategory[]>(() => [ALL_CATEGORY, ...this.categoryService.categories()]);

  protected readonly isDragging = signal(false);
  protected readonly isPrevHidden = signal(true);
  protected readonly isNextHidden = signal(false);
  protected readonly failedImages = signal<Set<string>>(new Set());

  protected readonly activeIndex = computed(() => this.chips().findIndex((c) => c.slug === this.activeSlug()));

  private isPressed = false;
  private dragStartX = 0;
  private dragStartScroll = 0;
  private suppressNextClick = false;

  constructor() {
    afterNextRender(() => this.updateArrows());
    // Categories now arrive async from CategoryService — re-check arrow visibility whenever the
    // chip list itself changes (not just on first render), since it starts empty then fills in.
    effect(() => {
      this.chips();
      this.updateArrows();
    });
    effect(() => {
      const index = this.activeIndex();
      setTimeout(() => this.scrollActiveIntoView(index));
    });
  }

  private get slider(): HTMLDivElement {
    return this.sliderRef.nativeElement;
  }

  private scrollActiveIntoView(index: number): void {
    const chip = this.slider?.children[index] as HTMLElement | undefined;
    chip?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  protected selectCategory(slug: string): void {
    this.categorySelected.emit(slug);
  }

  protected onImageError(slug: string): void {
    const next = new Set(this.failedImages());
    next.add(slug);
    this.failedImages.set(next);
  }

  protected slide(direction: 'prev' | 'next'): void {
    const slider = this.slider;
    const chip = slider.querySelector<HTMLElement>('.category-chip');
    if (!chip) return;
    const gap = parseFloat(getComputedStyle(slider).columnGap) || 0;
    const step = chip.getBoundingClientRect().width + gap;
    const visibleChips = Math.max(1, Math.round(slider.clientWidth / step));
    const scrollAmount = step * visibleChips;
    slider.scrollLeft += direction === 'next' ? scrollAmount : -scrollAmount;
  }

  protected updateArrows(): void {
    const slider = this.slider;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const atStart = slider.scrollLeft <= 2;
    const atEnd = slider.scrollLeft >= maxScroll - 2;
    this.isPrevHidden.set(atStart);
    this.isNextHidden.set(atEnd || maxScroll <= 2);
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.updateArrows();
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    this.isPressed = true;
    this.dragStartX = event.clientX;
    this.dragStartScroll = this.slider.scrollLeft;
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isPressed) return;
    const delta = event.clientX - this.dragStartX;
    if (!this.isDragging() && Math.abs(delta) > 5) {
      this.isDragging.set(true);
      this.suppressNextClick = true;
      this.slider.setPointerCapture(event.pointerId);
    }
    if (this.isDragging()) {
      this.slider.scrollLeft = this.dragStartScroll - delta;
    }
  }

  protected endDrag(): void {
    this.isPressed = false;
    this.isDragging.set(false);
  }

  protected onSliderClick(event: MouseEvent): void {
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
