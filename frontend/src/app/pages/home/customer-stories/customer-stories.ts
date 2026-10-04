import { Component, ElementRef, HostListener, ViewChild, afterNextRender, computed, effect, inject, signal, viewChildren } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';
import { TestimonialService } from '../../../shared/services/testimonial.service';

export interface Testimonial {
  initial: string;
  avatarGradient: string;
  name: string;
  text: string;
  /** Optional video uploaded from the admin panel — rendered above the quote when present. */
  videoUrl: string | null;
}

/**
 * Customer Stories — testimonial slider (Sample/FreshOMill.html CSS
 * "8. CUSTOMER STORIES SECTION", HTML "7. CUSTOMER STORIES — TESTIMONIAL
 * SLIDER"). Shares the exact same drag/scroll/arrow mechanics as Best
 * Sellers (both are driven by the mockup's one `initHorizontalSlider()`
 * helper) — duplicated here rather than factored into a shared slider
 * directive, since each rail's arrow markup/ids and card type differ
 * enough that a shared abstraction would need its own generic API; two
 * ~small, readable copies stay well under the component-style budget
 * either way.
 *
 * The mockup's Google "G" logo badge next to each name is inlined here as
 * `story-card`'s own SVG, same four-color paths as the mockup markup —
 * not an icon-CDN glyph.
 */
@Component({
  selector: 'app-customer-stories',
  imports: [Icon],
  templateUrl: './customer-stories.html',
  styleUrl: './customer-stories.css',
})
export class CustomerStories {
  @ViewChild('slider') private readonly sliderRef!: ElementRef<HTMLDivElement>;

  /** The quote paragraphs, so we can tell which ones the 5-line clamp is actually cutting off. */
  private readonly storyTexts = viewChildren<ElementRef<HTMLParagraphElement>>('storyText');

  private readonly testimonialService = inject(TestimonialService);

  protected readonly testimonials = this.testimonialService.testimonials;
  protected readonly loading = this.testimonialService.isLoading;

  /** Placeholder cards while the fetch is out, and no section at all once we know there are
   *  no stories — the heading used to sit above an empty rail in both cases. */
  protected readonly visible = computed(() => this.loading() || this.testimonials().length > 0);
  protected readonly skeletonSlots = Array.from({ length: 3 }, (_, i) => i);

  /** Five filled stars. Every testimonial the shop publishes is a five-star Google review —
   *  there is no per-story rating on the record to vary this from. */
  protected readonly stars = [1, 2, 3, 4, 5];

  /** Indices whose text overflows the clamp — only those get a "Read more" control.
   *  Previously *every* card rendered `<a href="#">Read more</a>`, which went nowhere and
   *  left long quotes permanently truncated. */
  private readonly clampedStories = signal<ReadonlySet<number>>(new Set());
  protected readonly expandedStories = signal<ReadonlySet<number>>(new Set());

  /** Bumped on resize so the clamp is re-measured — a card that fits at desktop width can
   *  overflow once the rail narrows to one column. */
  private readonly measureTick = signal(0);

  protected isClamped(index: number): boolean {
    return this.clampedStories().has(index);
  }

  protected isExpanded(index: number): boolean {
    return this.expandedStories().has(index);
  }

  protected toggleStory(index: number): void {
    const next = new Set(this.expandedStories());
    if (!next.delete(index)) {
      next.add(index);
    }
    this.expandedStories.set(next);
  }

  protected readonly isDragging = signal(false);
  protected readonly isPrevHidden = signal(true);
  protected readonly isNextHidden = signal(false);

  private isPressed = false;
  private dragStartX = 0;
  private dragStartScroll = 0;
  private suppressNextClick = false;

  constructor() {
    afterNextRender(() => this.updateArrows());
    // Testimonials now arrive async from TestimonialService — re-check arrow visibility
    // whenever the list itself changes (not just on first render), since it starts empty then fills in.
    effect(() => {
      this.testimonials();
      this.updateArrows();
    });

    // Measure the clamp after each render pass. An expanded card can't be measured (its clamp
    // is off), so it keeps whatever state it had — which is what makes "Show less" persist.
    effect(() => {
      const paragraphs = this.storyTexts();
      const expanded = this.expandedStories();
      this.measureTick();

      const current = this.clampedStories();
      const next = new Set(current);
      paragraphs.forEach((ref, index) => {
        if (expanded.has(index)) {
          return;
        }
        const el = ref.nativeElement;
        // +1 absorbs sub-pixel line-height rounding, which otherwise reports a fitting
        // paragraph as overflowing.
        if (el.scrollHeight > el.clientHeight + 1) {
          next.add(index);
        } else {
          next.delete(index);
        }
      });

      if (next.size !== current.size || [...next].some((i) => !current.has(i))) {
        this.clampedStories.set(next);
      }
    });
  }

  /** Null whenever the rail isn't rendered — the section sits behind an `@if`, so the
   *  data effect below can (and did) run on a pass where the element doesn't exist.
   *  Dereferencing it there threw inside change detection, which aborted the rest of
   *  that render pass and left the page half-painted until the next interaction. */
  private get slider(): HTMLDivElement | null {
    return this.sliderRef?.nativeElement ?? null;
  }

  protected slide(direction: 'prev' | 'next'): void {
    const slider = this.slider;
    if (!slider) {
      return;
    }
    const card = slider.querySelector<HTMLElement>('.story-card');
    if (!card) return;
    const gap = parseFloat(getComputedStyle(slider).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const visibleCards = Math.max(1, Math.round(slider.clientWidth / step));
    const scrollAmount = step * visibleCards;
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
    this.measureTick.update((n) => n + 1);
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
