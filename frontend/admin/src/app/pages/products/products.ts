import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AdminProduct, ProductInput, ProductVariantInput, ProductsService } from '../../core/services/products.service';
import { AdminCategory, CategoriesService } from '../../core/services/categories.service';
import { ImagesService } from '../../core/services/images.service';
import { extractErrorMessage } from '../../core/util/http-error';

let nextTempId = 1;

/** Variant row shape used only inside the form — `tempId` gives `@for` a stable track key for
 * newly-added rows that don't have a real backend id yet (id stays null until saved). */
interface VariantRow extends ProductVariantInput {
  tempId: number;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly imagesService = inject(ImagesService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly products = signal<AdminProduct[]>([]);
  protected readonly categories = signal<AdminCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formName = signal('');
  protected readonly formPrice = signal(0);
  protected readonly formUnit = signal('');
  protected readonly formCategoryId = signal('');
  /** Ordered gallery — index 0 becomes the product's primary image (the one every card/grid
   * already renders); the rest show up in the storefront's quick-add gallery. */
  protected readonly formImages = signal<string[]>([]);
  protected readonly formDescription = signal('');
  protected readonly formPopularity = signal(0);
  protected readonly formIsFeatured = signal(false);
  protected readonly formVariants = signal<VariantRow[]>([]);
  protected readonly formError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);

  constructor() {
    this.refresh();
    this.categoriesService.list().subscribe({ next: (categories) => this.categories.set(categories) });
  }

  private refresh(): void {
    this.loading.set(true);
    this.productsService.list().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Could not load products.');
        this.loading.set(false);
      },
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.formName.set('');
    this.formPrice.set(0);
    this.formUnit.set('');
    this.formCategoryId.set(this.categories()[0]?.id ?? '');
    this.formImages.set([]);
    this.formDescription.set('');
    this.formPopularity.set(0);
    this.formIsFeatured.set(false);
    this.formVariants.set([{ tempId: nextTempId++, id: null, label: '', price: 0, stockQuantity: 0, sortOrder: 1 }]);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(product: AdminProduct): void {
    this.editingId.set(product.id);
    this.formName.set(product.name);
    this.formPrice.set(product.price);
    this.formUnit.set(product.unit);
    this.formCategoryId.set(product.categoryId);
    this.formImages.set([...product.images]);
    this.formDescription.set(product.description);
    this.formPopularity.set(product.popularity);
    this.formIsFeatured.set(product.isFeatured);
    this.formVariants.set(
      product.variants.map((v) => ({ tempId: nextTempId++, id: v.id, label: v.label, price: v.price, stockQuantity: v.stockQuantity, sortOrder: v.sortOrder }))
    );
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
  }

  /** Multi-select — every chosen file uploads independently and appends to the gallery in
   * whatever order the browser reports them, so a partial failure (one bad file among five)
   * still keeps whichever uploads did succeed instead of losing the whole batch. */
  protected onFilesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (files.length === 0) {
      return;
    }
    this.uploading.set(true);
    let remaining = files.length;
    for (const file of files) {
      this.imagesService.upload(file).subscribe({
        next: (url) => {
          this.formImages.update((images) => [...images, url]);
          if (--remaining === 0) {
            this.uploading.set(false);
          }
        },
        error: (err: unknown) => {
          this.formError.set(extractErrorMessage(err) ?? 'Image upload failed.');
          if (--remaining === 0) {
            this.uploading.set(false);
          }
        },
      });
    }
    this.fileInput()!.nativeElement.value = '';
  }

  protected removeImage(index: number): void {
    this.formImages.update((images) => images.filter((_, i) => i !== index));
  }

  protected moveImage(index: number, direction: -1 | 1): void {
    this.formImages.update((images) => {
      const target = index + direction;
      if (target < 0 || target >= images.length) {
        return images;
      }
      const next = [...images];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  protected addVariantRow(): void {
    this.formVariants.update((rows) => [
      ...rows,
      { tempId: nextTempId++, id: null, label: '', price: 0, stockQuantity: 0, sortOrder: rows.length + 1 },
    ]);
  }

  protected removeVariantRow(tempId: number): void {
    this.formVariants.update((rows) => rows.filter((r) => r.tempId !== tempId));
  }

  protected updateVariantField<K extends 'label' | 'price' | 'stockQuantity' | 'sortOrder'>(
    tempId: number,
    field: K,
    value: VariantRow[K]
  ): void {
    this.formVariants.update((rows) => rows.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)));
  }

  /** Bypasses the whole-product Save — calls AdjustStockCommand directly for just this one
   * variant, with a reason, the way the Admin Panel plan's "manual stock adjustment with a
   * reason" item describes. Only available for variants that already exist (have a real id);
   * a brand-new unsaved row has nothing to adjust yet. */
  protected quickAdjustStock(row: VariantRow): void {
    if (!row.id) {
      return;
    }
    const reason = prompt(`Reason for changing stock on "${row.label}" (currently ${row.stockQuantity})?`);
    if (reason === null || reason.trim() === '') {
      return;
    }
    const newQuantityRaw = prompt('New stock quantity:', String(row.stockQuantity));
    if (newQuantityRaw === null) {
      return;
    }
    const newQuantity = Number(newQuantityRaw);
    if (!Number.isFinite(newQuantity) || newQuantity < 0) {
      alert('Enter a valid, non-negative quantity.');
      return;
    }

    this.productsService.adjustStock(row.id, newQuantity, reason.trim()).subscribe({
      next: (updated) => {
        this.updateVariantField(row.tempId, 'stockQuantity', newQuantity);
        this.products.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
      },
      error: (err: unknown) => alert(extractErrorMessage(err) ?? 'Could not adjust stock.'),
    });
  }

  protected save(): void {
    const name = this.formName().trim();
    const unit = this.formUnit().trim();
    const description = this.formDescription().trim();
    const categoryId = this.formCategoryId();
    const variants = this.formVariants();

    if (!name || !unit || !description || !categoryId) {
      this.formError.set('Name, unit, category, and description are all required.');
      return;
    }
    if (variants.length === 0 || variants.some((v) => !v.label.trim())) {
      this.formError.set('Every pack size needs a label, and there must be at least one.');
      return;
    }

    const input: ProductInput = {
      name,
      price: this.formPrice(),
      unit,
      categoryId,
      imageUrls: this.formImages(),
      description,
      popularity: this.formPopularity(),
      isFeatured: this.formIsFeatured(),
      variants: variants.map(({ tempId: _tempId, ...rest }) => rest),
    };

    this.saving.set(true);
    const id = this.editingId();
    const request = id ? this.productsService.update(id, input) : this.productsService.create(input);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.refresh();
      },
      error: (err: unknown) => {
        this.formError.set(extractErrorMessage(err) ?? 'Could not save product.');
        this.saving.set(false);
      },
    });
  }

  protected remove(product: AdminProduct): void {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) {
      return;
    }
    this.productsService.remove(product.id).subscribe({
      next: () => this.refresh(),
      error: (err: unknown) => alert(extractErrorMessage(err) ?? 'Could not delete product.'),
    });
  }
}
