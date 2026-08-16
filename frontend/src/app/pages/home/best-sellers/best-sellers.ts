import { Component, ElementRef, HostListener, ViewChild, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { SellerCard, SellerProduct } from '../../../shared/seller-card/seller-card';
import { Icon } from '../../../shared/icon/icon';
import { ProductService } from '../../../shared/services/product.service';

/** Curated names, in display order — matched against `ProductService`'s backend-fetched
 *  catalog (the single source of truth for product name/price/unit/image) rather than
 *  duplicated here, so Best Sellers can never drift out of sync with Store's own catalog data. */
const BEST_SELLER_NAMES = [
  'Chakki Fresh Atta',
  'Organic Bajra',
  'Pure Honey',
  'Coconut Oil',
  'Organic Turmeric',
  'Almonds Premium',
  'Mustard Oil',
  'Chana Dal',
  'Sesame Seeds',
  'Cumin Seeds',
  'Cashew Nuts',
  'Coriander Powder',
];

/**
 * Best Sellers — horizontal, manually-draggable slider (Sample/FreshOMill.html
 * CSS "6. BEST SELLERS SECTION", HTML "6. BEST SELLERS — HORIZONTAL SLIDER
 * WITH MANUAL NAVIGATION"). Behavior ported 1:1 from the mockup's
 * `initHorizontalSlider()` (shared there with Customer Stories):
 *  - `slide(direction)` reads the first card's rendered width + the
 *    slider's column-gap to compute exactly one "page" of cards, then
 *    nudges `scrollLeft` by that amount (native CSS `scroll-snap-type: x
 *    mandatory` settles it on a card boundary);
 *  - arrows hide themselves via `updateArrows()` when there's nothing left
 *    to scroll to in that direction (checked on scroll + resize + init);
 *  - mouse-drag: pointerdown records a start X/scrollLeft, pointermove
 *    only engages dragging past a 5px threshold (so a plain click still
 *    click-throughs to nested links), pointer capture keeps the drag going
 *    even if the cursor leaves the slider, and a drag suppresses the
 *    `click` that follows it. Touch/trackpad panning already works
 *    natively via `overflow-x: auto` and isn't re-implemented here.
 *
 * Cart state now lives entirely in `SellerCard` itself (backed by the
 * shared `CartService`) — this component used to own a local `qty` signal
 * per product before a real cart existed; that ownership has moved out
 * now that one does, so this component no longer touches cart state at
 * all.
 */
@Component({
  selector: 'app-best-sellers',
  imports: [SellerCard, Icon],
  templateUrl: './best-sellers.html',
  styleUrl: './best-sellers.css',
})
export class BestSellers {
  @ViewChild('slider') private readonly sliderRef!: ElementRef<HTMLDivElement>;

  private readonly productService = inject(ProductService);

  /** Products start empty until ProductService's fetch resolves — `.find()` misses are
   *  filtered out (not asserted non-null) so this stays a no-op until then, rather than
   *  throwing on the first render. */
  protected readonly products = computed<SellerProduct[]>(() => {
    const catalog = this.productService.products();
    return BEST_SELLER_NAMES.map((name) => catalog.find((p) => p.name === name))
      .filter((product) => product !== undefined)
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image,
        description: product.description,
        variants: product.variants,
      }));
  });

  protected readonly isDragging = signal(false);
  protected readonly isPrevHidden = signal(true);
  protected readonly isNextHidden = signal(false);

  private isPressed = false;
  private dragStartX = 0;
  private dragStartScroll = 0;
  private suppressNextClick = false;

  constructor() {
    afterNextRender(() => this.updateArrows());
    // Products now arrive async from ProductService — re-check arrow visibility whenever the
    // list itself changes (not just on first render), since it starts empty then fills in.
    effect(() => {
      this.products();
      this.updateArrows();
    });
  }

  private get slider(): HTMLDivElement {
    return this.sliderRef.nativeElement;
  }

  protected slide(direction: 'prev' | 'next'): void {
    const slider = this.slider;
    const card = slider.querySelector<HTMLElement>('.seller-card');
    if (!card) return;
    const gap = parseFloat(getComputedStyle(slider).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const visibleCards = Math.max(1, Math.round(slider.clientWidth / step));
    const scrollAmount = step * visibleCards;
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
