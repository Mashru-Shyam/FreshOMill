import { Component, ElementRef, HostListener, ViewChild, afterNextRender, effect, inject, signal } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';
import { TestimonialService } from '../../../shared/services/testimonial.service';

export interface Testimonial {
  initial: string;
  avatarGradient: string;
  name: string;
  text: string;
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

  private readonly testimonialService = inject(TestimonialService);

  protected readonly testimonials = this.testimonialService.testimonials;

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
  }

  private get slider(): HTMLDivElement {
    return this.sliderRef.nativeElement;
  }

  protected slide(direction: 'prev' | 'next'): void {
    const slider = this.slider;
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
