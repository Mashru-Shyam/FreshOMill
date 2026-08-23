import { Injectable, computed, effect, signal } from '@angular/core';
import type { ProductVariant } from '../data/catalog';

export interface ProfileAnchor {
  top: number;
  right: number;
}
export interface QuickAddProduct {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  readonly images?: readonly string[];
  readonly price: number;
  readonly unit: string;
  readonly inStock: boolean;
  readonly description?: string;
  readonly variants: readonly ProductVariant[];
}

@Injectable({ providedIn: 'root' })
export class OverlayService {
  readonly profileOpen = signal(false);
  readonly desktopSearchOpen = signal(false);
  readonly mobileSearchOpen = signal(false);
  readonly cartDrawerOpen = signal(false);
  readonly quickAddProduct = signal<QuickAddProduct | null>(null);
  readonly profileAnchor = signal<ProfileAnchor | null>(null);
  readonly profileIsBottomSheet = signal(false);

  justOpenedProfile = false;
  private readonly scrollLocked = computed(
    () =>
      (this.profileOpen() && this.profileIsBottomSheet()) ||
      this.cartDrawerOpen() ||
      this.quickAddProduct() !== null
  );

  constructor() {
    effect(() => {
      if (typeof document === 'undefined') {
        return;
      }
      document.body.style.overflow = this.scrollLocked() ? 'hidden' : '';
    });
  }

  toggleProfile(anchor: ProfileAnchor | null): void {
    if (this.profileOpen()) {
      this.closeProfile();
    } else {
      this.openProfile(anchor);
    }
  }

  openProfile(anchor: ProfileAnchor | null): void {
    this.closeAll();
    this.profileIsBottomSheet.set(typeof window !== 'undefined' && window.innerWidth <= 960);
    this.profileAnchor.set(anchor);
    this.profileOpen.set(true);

    this.justOpenedProfile = true;
    queueMicrotask(() => {
      this.justOpenedProfile = false;
    });
  }

  closeProfile(): void {
    this.profileOpen.set(false);
  }

  openDesktopSearch(): void {
    this.closeAll();
    this.desktopSearchOpen.set(true);
  }

  closeDesktopSearch(): void {
    this.desktopSearchOpen.set(false);
  }

  openMobileSearch(): void {
    this.closeAll();
    this.mobileSearchOpen.set(true);
  }

  closeMobileSearch(): void {
    this.mobileSearchOpen.set(false);
  }

  openCartDrawer(): void {
    this.closeAll();
    this.cartDrawerOpen.set(true);
  }

  closeCartDrawer(): void {
    this.cartDrawerOpen.set(false);
  }
  
  openQuickAdd(product: QuickAddProduct): void {
    this.closeAll();
    this.quickAddProduct.set(product);
  }

  closeQuickAdd(): void {
    this.quickAddProduct.set(null);
  }

  closeAll(): void {
    this.profileOpen.set(false);
    this.desktopSearchOpen.set(false);
    this.mobileSearchOpen.set(false);
    this.cartDrawerOpen.set(false);
    this.quickAddProduct.set(null);
  }
}
