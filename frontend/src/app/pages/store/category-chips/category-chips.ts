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
import { AllProductsImageService } from '../../../shared/services/all-products-image.service';
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
  private readonly allProductsImageService = inject(AllProductsImageService);

  protected readonly chips = computed<StoreCategory[]>(() => [
    { ...ALL_CATEGORY, image: this.allProductsImageService.image() },
    ...this.categoryService.categories(),
  ]);

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

  /** Null whenever the rail isn't rendered — the section sits behind an `@if`, so the
   *  data effect below can (and did) run on a pass where the element doesn't exist.
   *  Dereferencing it there threw inside change detection, which aborted the rest of
   *  that render pass and left the page half-painted until the next interaction. */
  private get slider(): HTMLDivElement | null {
    return this.sliderRef?.nativeElement ?? null;
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
    if (!slider) {
      return;
    }
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
    if (!slider) {
      return;
    }
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
    if (event.pointerType !== 'mouse' || !this.slider) return;
    this.isPressed = true;
    this.dragStartX = event.clientX;
    this.dragStartScroll = this.slider.scrollLeft;
  }

  protected onPointerMove(event: PointerEvent): void {
    const slider = this.slider;
    if (!this.isPressed || !slider) return;
    const delta = event.clientX - this.dragStartX;
    if (!this.isDragging() && Math.abs(delta) > 5) {
      this.isDragging.set(true);
      this.suppressNextClick = true;
      slider.setPointerCapture(event.pointerId);
    }
    if (this.isDragging()) {
      slider.scrollLeft = this.dragStartScroll - delta;
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
