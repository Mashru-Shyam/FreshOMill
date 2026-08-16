import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OverlayService } from '../services/overlay.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { ConfirmService } from '../services/confirm.service';
import { Icon } from '../icon/icon';

/**
 * Shopping cart drawer (`.cart-overlay`/`.cart-drawer` in Sample/Store.html)
 * — opened from the navbar's cart icon button. Desktop/tablet: centered,
 * fixed-height (640px) modal. Mobile (<=639px): bottom sheet.
 *
 * Always mounted — open/closed is `overlay.cartDrawerOpen()` driving a CSS
 * class, not `@if`, same reasoning as the profile popover/mobile drawer
 * (it scales/slides in via CSS transition).
 *
 * Self-contained overlay+blur (its own `.cart-overlay`), not the shared
 * `<app-backdrop>` — same as the quick-add modal, mirroring the mockup's
 * comment that both popups own their own dim+blur.
 */
@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, Icon],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css',
})
export class CartDrawer {
  constructor(
    protected readonly overlay: OverlayService,
    protected readonly cart: CartService,
    protected readonly auth: AuthService,
    private readonly toast: ToastService,
    private readonly confirmService: ConfirmService
  ) {}

  protected readonly failedImages = signal<Set<string>>(new Set());

  protected onImageError(lineId: string): void {
    const next = new Set(this.failedImages());
    next.add(lineId);
    this.failedImages.set(next);
  }

  protected close(): void {
    this.overlay.closeCartDrawer();
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected increment(lineId: string, currentQty: number): void {
    this.cart.setQty(lineId, currentQty + 1);
  }

  protected decrement(lineId: string, currentQty: number): void {
    this.cart.setQty(lineId, currentQty - 1);
  }

  protected async remove(lineId: string): Promise<void> {
    const line = this.cart.lines().find((l) => l.id === lineId);
    if (!line) {
      return;
    }
    const confirmed = await this.confirmService.confirm(`Remove ${line.name} from your cart?`, {
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.cart.remove(lineId);
    this.toast.show(`Removed ${line.name} from cart`, 'info');
  }

  /** Checkout requires sign-in — a logged-out click opens the sign-in step instead of
   *  navigating, mirroring the mockup's checkoutBtn click handler. There's no navbar
   *  profile-button element reference available from here, so the popover opens
   *  un-anchored (falls back to its default position) rather than pinned under the
   *  profile icon — a minor, documented deviation from the mockup, which always anchors
   *  to the one stable navbar button regardless of caller. */
  protected onCheckoutClick(event: MouseEvent): void {
    if (!this.auth.isLoggedIn()) {
      event.preventDefault();
      event.stopPropagation();
      this.overlay.openProfile(null);
      return;
    }
    this.close();
  }

  /** Sign-in link inside the empty-cart auth notice — opens the popover directly
   *  (mirrors the mockup's cartSignInLink click handler). */
  protected openSignIn(event: MouseEvent): void {
    event.stopPropagation();
    this.overlay.openProfile(null);
  }
}
