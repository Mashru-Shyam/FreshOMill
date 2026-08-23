import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AdminCategory, CategoriesService, CategoryInput } from '../../core/services/categories.service';
import { ImagesService } from '../../core/services/images.service';
import { extractErrorMessage } from '../../core/util/http-error';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  styleUrl: '../products/products.css',
})
export class Categories {
  private readonly categoriesService = inject(CategoriesService);
  private readonly imagesService = inject(ImagesService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly categories = signal<AdminCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formName = signal('');
  protected readonly formImageUrl = signal<string | null>(null);
  protected readonly formDisplayOrder = signal(0);
  protected readonly formError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);

  constructor() {
    this.refresh();
  }

  private refresh(): void {
    this.loading.set(true);
    this.categoriesService.list().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Could not load categories.');
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.formName.set('');
    this.formImageUrl.set(null);
    this.formDisplayOrder.set(this.categories().length + 1);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(category: AdminCategory): void {
    this.editingId.set(category.id);
    this.formName.set(category.name);
    this.formImageUrl.set(category.imageUrl);
    this.formDisplayOrder.set(category.displayOrder);
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
    const name = this.formName().trim();
    if (!name) {
      this.formError.set('Name is required.');
      return;
    }

    const input: CategoryInput = {
      name,
      imageUrl: this.formImageUrl(),
      displayOrder: this.formDisplayOrder(),
    };

    this.saving.set(true);
    const id = this.editingId();
    const request = id ? this.categoriesService.update(id, input) : this.categoriesService.create(input);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.refresh();
      },
      error: (err: unknown) => {
        this.formError.set(extractErrorMessage(err) ?? 'Could not save category.');
        this.saving.set(false);
      },
    });
  }

  protected remove(category: AdminCategory): void {
    if (!confirm(`Delete "${category.name}"? This can't be undone.`)) {
      return;
    }
    this.categoriesService.remove(category.id).subscribe({
      next: () => this.refresh(),
      error: (err: unknown) => alert(extractErrorMessage(err) ?? 'Could not delete category.'),
    });
  }
}
