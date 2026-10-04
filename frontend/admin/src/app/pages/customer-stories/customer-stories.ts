import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { AdminTestimonial, TestimonialInput, TestimonialsService } from '../../core/services/testimonials.service';
import { VideosService } from '../../core/services/videos.service';
import { extractErrorMessage } from '../../core/util/http-error';
import { DialogFocus } from '../../core/util/dialog-focus.directive';
import { EmptyState, TableSkeleton } from '../../shared/states/table-states';

@Component({
  selector: 'app-customer-stories',
  imports: [DialogFocus, EmptyState, TableSkeleton],
  templateUrl: './customer-stories.html',
  styleUrl: '../products/products.css',
})
export class CustomerStories {
  private readonly storiesService = inject(TestimonialsService);
  private readonly videosService = inject(VideosService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly stories = signal<AdminTestimonial[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  /** Client-side over the already-loaded list — same approach as the other admin screens. */
  protected readonly search = signal('');

  protected readonly filteredStories = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.stories();
    }
    return this.stories().filter(
      (story) => story.name.toLowerCase().includes(term) || story.text.toLowerCase().includes(term)
    );
  });

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formName = signal('');
  protected readonly formText = signal('');
  protected readonly formVideoUrl = signal<string | null>(null);
  protected readonly formDisplayOrder = signal(0);
  protected readonly formError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly isDragOver = signal(false);

  constructor() {
    this.refresh();
  }

  /** Also the Retry action on the error state. */
  protected refresh(): void {
    this.loading.set(true);
    this.storiesService.list().subscribe({
      next: (stories) => {
        this.stories.set(stories);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Could not load customer stories.');
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.formName.set('');
    this.formText.set('');
    this.formVideoUrl.set(null);
    this.formDisplayOrder.set(this.stories().length + 1);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(story: AdminTestimonial): void {
    this.editingId.set(story.id);
    this.formName.set(story.name);
    this.formText.set(story.text);
    this.formVideoUrl.set(story.videoUrl);
    this.formDisplayOrder.set(story.displayOrder);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
  }

  protected onFileSelected(event: Event): void {
    this.uploadFile((event.target as HTMLInputElement).files?.[0]);
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

  protected removeVideo(): void {
    this.formVideoUrl.set(null);
  }

  private uploadFile(file: File | undefined): void {
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.formError.set(null);
    this.videosService.upload(file).subscribe({
      next: (url) => {
        this.formVideoUrl.set(url);
        this.uploading.set(false);
      },
      error: (err: unknown) => {
        this.formError.set(extractErrorMessage(err) ?? 'Video upload failed.');
        this.uploading.set(false);
      },
    });
  }

  protected save(): void {
    const name = this.formName().trim();
    const text = this.formText().trim();

    if (!name || !text) {
      this.formError.set('Customer name and the story text are both required.');
      return;
    }

    const input: TestimonialInput = {
      name,
      text,
      videoUrl: this.formVideoUrl(),
      displayOrder: this.formDisplayOrder(),
    };

    this.saving.set(true);
    const id = this.editingId();
    const request = id ? this.storiesService.update(id, input) : this.storiesService.create(input);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.refresh();
      },
      error: (err: unknown) => {
        this.formError.set(extractErrorMessage(err) ?? 'Could not save the customer story.');
        this.saving.set(false);
      },
    });
  }

  protected remove(story: AdminTestimonial): void {
    if (!confirm(`Delete the story from "${story.name}"? This can't be undone.`)) {
      return;
    }
    this.storiesService.remove(story.id).subscribe({
      next: () => this.refresh(),
      error: (err: unknown) => alert(extractErrorMessage(err) ?? 'Could not delete the customer story.'),
    });
  }
}
