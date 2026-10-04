import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { AdminHeroSlide, HeroSlideInput, HeroSlidesService } from '../../core/services/hero-slides.service';
import { ImagesService } from '../../core/services/images.service';
import { extractErrorMessage } from '../../core/util/http-error';
import { DialogFocus } from '../../core/util/dialog-focus.directive';
import { EmptyState, TableSkeleton } from '../../shared/states/table-states';

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1f736f 0%, #4553c4 100%)';
const DEFAULT_ICON = 'package';

@Component({
  selector: 'app-hero-slides',
  imports: [DialogFocus, EmptyState, TableSkeleton],
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

  /** Client-side over the already-loaded list — see the same note on Products. */
  protected readonly search = signal('');

  protected readonly filteredSlides = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.slides();
    }
    return this.slides().filter(
      (slide) => slide.title.toLowerCase().includes(term) || slide.alt.toLowerCase().includes(term)
    );
  });

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formImageUrl = signal<string | null>(null);
  protected readonly formAlt = signal('');
  protected readonly formTitle = signal('');
  protected readonly formDisplayOrder = signal(0);
  protected readonly formError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly isDragOver = signal(false);

  // Subtitle/icon/fallback-gradient aren't collected in this simplified form anymore — they only
  // ever render if a slide's image fails to load (see the customer hero-slider's fallback panel),
  // so a new slide gets harmless defaults and an edited slide keeps whatever it already had.
  private editingSubtitle = '';
  private editingIcon = DEFAULT_ICON;
  private editingFallbackGradient = DEFAULT_GRADIENT;

  constructor() {
    this.refresh();
  }

  /** Also the Retry action on the error state. */
  protected refresh(): void {
    this.loading.set(true);
    this.heroSlidesService.list().subscribe({
      next: (slides) => {
        this.slides.set(slides);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Could not load slides.');
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.formImageUrl.set(null);
    this.formAlt.set('');
    this.formTitle.set('');
    this.formDisplayOrder.set(this.slides().length + 1);
    this.editingSubtitle = '';
    this.editingIcon = DEFAULT_ICON;
    this.editingFallbackGradient = DEFAULT_GRADIENT;
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(slide: AdminHeroSlide): void {
    this.editingId.set(slide.id);
    this.formImageUrl.set(slide.imageUrl);
    this.formAlt.set(slide.alt);
    this.formTitle.set(slide.title);
    this.formDisplayOrder.set(slide.displayOrder);
    this.editingSubtitle = slide.subtitle;
    this.editingIcon = slide.icon;
    this.editingFallbackGradient = slide.fallbackGradient;
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.uploadFile(file);
    this.fileInput()!.nativeElement.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(): void {
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    this.uploadFile(event.dataTransfer?.files?.[0]);
  }

  protected removeImage(): void {
    this.formImageUrl.set(null);
  }

  private uploadFile(file: File | undefined): void {
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.formError.set(null);
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
  }

  protected save(): void {
    const title = this.formTitle().trim();
    const alt = this.formAlt().trim();

    if (!title || !alt) {
      this.formError.set('Title and image alt text are both required.');
      return;
    }

    const input: HeroSlideInput = {
      imageUrl: this.formImageUrl(),
      alt,
      icon: this.editingIcon,
      title,
      subtitle: this.editingSubtitle,
      fallbackGradient: this.editingFallbackGradient,
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
        this.formError.set(extractErrorMessage(err) ?? 'Could not save slide.');
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
      error: (err: unknown) => alert(extractErrorMessage(err) ?? 'Could not delete slide.'),
    });
  }
}
