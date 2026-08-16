export interface StoreCategory {
  readonly slug: string;
  readonly name: string;
  readonly image: string;
}

export const ALL_CATEGORY: StoreCategory = { slug: 'all', name: 'All Products', image: 'assets/images/categories/all-products.jpg' };

// Real categories (everything but the synthetic "All Products" pseudo-category above) come from
// the backend now — see CategoryService. No hardcoded STORE_CATEGORIES array here anymore.

export interface ProductVariant {
  readonly label: string;
  readonly price: number;
  readonly stockQuantity: number;
}

export interface StoreProduct {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly unit: string;
  readonly categorySlug: string;
  readonly image: string;
  readonly inStock: boolean;
  readonly description: string;
  readonly popularity: number;
  /** Real pack-size/price/stock rows from the backend's ProductVariant table — replaces the old
   *  client-side fabrication in shared/util/product-variants.ts (deriveWeightVariants()/
   *  stockCountFor(), which invented a second pack size and a fake stock count from a name hash). */
  readonly variants: readonly ProductVariant[];
}

// Real products come from the backend now — see ProductService. No hardcoded STORE_PRODUCTS
// array here anymore.
