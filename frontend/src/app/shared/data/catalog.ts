import { API_BASE_URL } from '../config/api.config';

export interface StoreCategory {
  readonly slug: string;
  readonly name: string;
  readonly image: string;
}

export const ALL_CATEGORY: StoreCategory = {
  slug: 'all',
  name: 'All Products',
  image: `${API_BASE_URL}/images/categories/all-products.jpg`,
};

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
  /** Admin-controlled flag driving the Home page's Best Sellers rail — see BestSellers, which
   *  filters on this instead of a hardcoded product-name list. */
  readonly isFeatured: boolean;
  /** Real pack-size/price/stock rows from the backend's ProductVariant table — replaces the old
   *  client-side fabrication in shared/util/product-variants.ts (deriveWeightVariants()/
   *  stockCountFor(), which invented a second pack size and a fake stock count from a name hash). */
  readonly variants: readonly ProductVariant[];
  /** Full ordered image gallery from the admin panel's Products screen — `image` above is
   *  always the same photo as `images[0]`, kept separately since every card/grid/search view
   *  only ever needs the one primary photo. The quick-add modal is what shows the rest. */
  readonly images: readonly string[];
}

// Real products come from the backend now — see ProductService. No hardcoded STORE_PRODUCTS
// array here anymore.
