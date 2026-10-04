import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { AdminCategory, CategoriesService, CategoryInput } from '../../core/services/categories.service';
import { AllProductsImageService } from '../../core/services/all-products-image.service';
import { ImagesService } from '../../core/services/images.service';
import { extractErrorMessage } from '../../core/util/http-error';
import { DialogFocus } from '../../core/util/dialog-focus.directive';
import { EmptyState, TableSkeleton } from '../../shared/states/table-states';

@Component({
  selector: 'app-categories',
  imports: [DialogFocus, EmptyState, TableSkeleton],
  templateUrl: './categories.html',
  styleUrl: '../products/products.css',
})
export class Categories {
  private readonly categoriesService = inject(CategoriesService);
  private readonly allProductsImageService = inject(AllProductsImageService);
  private readonly imagesService = inject(ImagesService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly allProductsFileInput = viewChild<ElementRef<HTMLInputElement>>('allProductsFileInput');

  protected readonly categories = signal<AdminCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  /** Client-side over the already-loaded list — see the same note on Products. */
  protected readonly search = signal('');

  protected readonly filteredCategories = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.categories();
    }
    return this.categories().filter(
      (category) => category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term)
    );
  });

  /** The pinned "All Products" row isn't a real Category row, so it isn't in `categories()` and
   *  has to be matched against the search term separately — otherwise it would sit at the top
   *  of the results for every search, including ones it clearly doesn't match. */
  protected readonly showAllProductsRow = computed(() => {
    const term = this.search().trim().toLowerCase();
    return term === '' || 'all products'.includes(term);
  });

  protected readonly visibleCount = computed(
    () => this.filteredCategories().length + (this.showAllProductsRow() ? 1 : 0)
  );

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formName = signal('');
  protected readonly formImageUrl = signal<string | null>(null);
  protected readonly formDisplayOrder = signal(0);
  protected readonly formError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly isDragOver = signal(false);

  // "All Products" is the storefront's synthetic category chip, not a real Category row — see
  // AllProductsImageService. Pinned as the first table row; only its image can be changed.
  protected readonly allProductsImageUrl = signal<string | null>(null);
  protected readonly allProductsFormOpen = signal(false);
  protected readonly allProductsFormImageUrl = signal<string | null>(null);
  protected readonly allProductsError = signal<string | null>(null);
  protected readonly allProductsSaving = signal(false);
  protected readonly allProductsUploading = signal(false);
  protected readonly allProductsIsDragOver = signal(false);

  constructor() {
    this.refresh();
    this.allProductsImageService.get().subscribe({
      next: (url) => this.allProductsImageUrl.set(url),
      error: () => this.allProductsImageUrl.set(null),
    });
  }

  /** Also the Retry action on the error state. */
  protected refresh(): void {
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

  protected openAllProductsEdit(): void {
    this.allProductsFormImageUrl.set(this.allProductsImageUrl());
    this.allProductsError.set(null);
    this.allProductsFormOpen.set(true);
  }

  protected closeAllProductsForm(): void {
    this.allProductsFormOpen.set(false);
  }

  protected onAllProductsFileSelected(event: Event): void {
    this.uploadAllProductsFile((event.target as HTMLInputElement).files?.[0]);
    this.allProductsFileInput()!.nativeElement.value = '';
  }

  protected onAllProductsDragOver(event: DragEvent): void {
    event.preventDefault();
    this.allProductsIsDragOver.set(true);
  }

  protected onAllProductsDragLeave(): void {
    this.allProductsIsDragOver.set(false);
  }

  protected onAllProductsDrop(event: DragEvent): void {
    event.preventDefault();
    this.allProductsIsDragOver.set(false);
    this.uploadAllProductsFile(event.dataTransfer?.files?.[0]);
  }

  protected removeAllProductsImage(): void {
    this.allProductsFormImageUrl.set(null);
  }

  private uploadAllProductsFile(file: File | undefined): void {
    if (!file) {
      return;
    }
    this.allProductsUploading.set(true);
    this.allProductsError.set(null);
    this.imagesService.upload(file).subscribe({
      next: (url) => {
        this.allProductsFormImageUrl.set(url);
        this.allProductsUploading.set(false);
      },
      error: (err: unknown) => {
        this.allProductsError.set(extractErrorMessage(err) ?? 'Image upload failed.');
        this.allProductsUploading.set(false);
      },
    });
  }

  protected saveAllProductsImage(): void {
    this.allProductsSaving.set(true);
    this.allProductsImageService.update(this.allProductsFormImageUrl()).subscribe({
      next: () => {
        this.allProductsImageUrl.set(this.allProductsFormImageUrl());
        this.allProductsSaving.set(false);
        this.allProductsFormOpen.set(false);
      },
      error: (err: unknown) => {
        this.allProductsError.set(extractErrorMessage(err) ?? 'Could not save image.');
        this.allProductsSaving.set(false);
      },
    });
  }
}
