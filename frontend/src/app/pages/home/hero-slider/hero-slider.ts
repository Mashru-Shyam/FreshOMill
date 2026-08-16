import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';
import { HeroSlideService } from '../../../shared/services/hero-slide.service';

/**
 * Autoplaying hero banner (Sample/FreshOMill.html's `.hero-slider`,
 * `#heroSlider`/`#heroSliderTrack`, CSS "4. INFINITE IMAGE SLIDER").
 * Mirrors the mockup's vanilla-JS behavior exactly:
 *  - `setInterval` advances one slide every 4000ms (`startAutoSlide`);
 *  - hovering the slider pauses it (`mouseenter`/`mouseleave` →
 *    stop/startAutoSlide) — reproduced here with (mouseenter)/(mouseleave)
 *    template bindings instead of DOM listeners;
 *  - clicking an arrow or a dot jumps to that slide *and* restarts the
 *    4000ms timer (`goToSlide` + `startAutoSlide`), so manual navigation
 *    doesn't fight with an autoplay tick landing moments later.
 * Slides come from `HeroSlideService` (backend-fetched) — starts empty until that
 * resolves, so `goToSlide` guards against an empty list instead of dividing by zero.
 * The `<img>` keeps the mockup's `(error)` swap to the gradient+icon
 * `.hero-slider__fallback` panel in case a file ever goes missing.
 */
@Component({
  selector: 'app-hero-slider',
  imports: [Icon],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css',
})
export class HeroSlider {
  private readonly heroSlideService = inject(HeroSlideService);

  protected readonly slides = this.heroSlideService.slides;

  protected readonly currentSlide = signal(0);
  protected readonly failedImages = signal<Set<number>>(new Set());

  private autoSlideInterval?: ReturnType<typeof setInterval>;

  constructor(destroyRef: DestroyRef) {
    afterNextRender(() => this.startAutoSlide());
    destroyRef.onDestroy(() => this.stopAutoSlide());
  }

  protected onImageError(index: number): void {
    const next = new Set(this.failedImages());
    next.add(index);
    this.failedImages.set(next);
  }

  protected goToSlide(index: number): void {
    const total = this.slides().length;
    if (total === 0) {
      return;
    }
    this.currentSlide.set(((index % total) + total) % total);
  }

  protected onArrowOrDotClick(index: number): void {
    this.goToSlide(index);
    this.startAutoSlide();
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      this.goToSlide(this.currentSlide() + 1);
    }, 4000);
  }

  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = undefined;
    }
  }

  protected onMouseEnter(): void {
    this.stopAutoSlide();
  }

  protected onMouseLeave(): void {
    this.startAutoSlide();
  }
}
