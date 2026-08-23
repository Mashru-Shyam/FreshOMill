import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AdminHeroSlide, HeroSlideInput, HeroSlidesService } from '../../core/services/hero-slides.service';
import { ImagesService } from '../../core/services/images.service';
import { extractErrorMessage } from '../../core/util/http-error';

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1f736f 0%, #4553c4 100%)';

@Component({
  selector: 'app-hero-slides',
  templateUrl: './hero-slides.html',
  styleUrl: '../products/products.css',
})
export class HeroSlides {
  private readonly heroSlidesService = inject(HeroSlidesService);
  private readonly imagesService = inject(ImagesService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly slides = signal<AdminHeroSlide[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formImageUrl = signal<string | null>(null);
  protected readonly formAlt = signal('');
  protected readonly formIcon = signal('wheat');
  protected readonly formTitle = signal('');
  protected readonly formSubtitle = signal('');
  protected readonly formFallbackGradient = signal(DEFAULT_GRADIENT);
  protected readonly formDisplayOrder = signal(0);
  protected readonly formError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);

  constructor() {
    this.refresh();
  }

  private refresh(): void {
    this.loading.set(true);
    this.heroSlidesService.list().subscribe({
      next: (slides) => {
        this.slides.set(slides);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Could not load hero slides.');
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.formImageUrl.set(null);
    this.formAlt.set('');
    this.formIcon.set('wheat');
    this.formTitle.set('');
    this.formSubtitle.set('');
    this.formFallbackGradient.set(DEFAULT_GRADIENT);
    this.formDisplayOrder.set(this.slides().length + 1);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(slide: AdminHeroSlide): void {
    this.editingId.set(slide.id);
    this.formImageUrl.set(slide.imageUrl);
    this.formAlt.set(slide.alt);
    this.formIcon.set(slide.icon);
    this.formTitle.set(slide.title);
    this.formSubtitle.set(slide.subtitle);
    this.formFallbackGradient.set(slide.fallbackGradient);
    this.formDisplayOrder.set(slide.displayOrder);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.imagesService.upload(file).subscribe({
      next: (url) => {
        this.formImageUrl.set(url);
        this.uploading.set(false);
      },
      error: (err: unknown) => {
        this.formError.set(extractErrorMessage(err) ?? 'Image upload failed.');
        this.uploading.set(false);
      },
    });
    this.fileInput()!.nativeElement.value = '';
  }

  protected save(): void {
    const alt = this.formAlt().trim();
    const icon = this.formIcon().trim();
    const title = this.formTitle().trim();
    const subtitle = this.formSubtitle().trim();
    const fallbackGradient = this.formFallbackGradient().trim();

    if (!alt || !icon || !title || !subtitle || !fallbackGradient) {
      this.formError.set('Every field except the image is required.');
      return;
    }

    const input: HeroSlideInput = {
      imageUrl: this.formImageUrl(),
      alt,
      icon,
      title,
      subtitle,
      fallbackGradient,
      displayOrder: this.formDisplayOrder(),
    };

    this.saving.set(true);
    const id = this.editingId();
    const request = id ? this.heroSlidesService.update(id, input) : this.heroSlidesService.create(input);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.refresh();
      },
      error: (err: unknown) => {
        this.formError.set(extractErrorMessage(err) ?? 'Could not save hero slide.');
        this.saving.set(false);
      },
    });
  }

  protected remove(slide: AdminHeroSlide): void {
    if (!confirm(`Delete the "${slide.title}" slide? This can't be undone.`)) {
      return;
    }
    this.heroSlidesService.remove(slide.id).subscribe({
      next: () => this.refresh(),
      error: (err: unknown) => alert(extractErrorMessage(err) ?? 'Could not delete hero slide.'),
    });
  }
}
