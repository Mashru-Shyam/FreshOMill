import { Component, EventEmitter, Output, computed, input, signal } from '@angular/core';
import { CartService } from '../../../shared/services/cart.service';
import { AuthService } from '../../../shared/services/auth.service';
import { OverlayService } from '../../../shared/services/overlay.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { BuyNowService } from '../../../shared/services/buy-now.service';
import { Icon } from '../../../shared/icon/icon';
import type { PaymentMethod } from '../../../shared/services/orders.service';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, amountToFreeDelivery } from '../../../shared/data/delivery';

/**
 * Order summary rail (Sample/Checkout.html's `.checkout-summary` aside) plus the sticky
 * mobile bottom bar (`.checkout-mobile-actionbar`) that mirrors the same Total + "Pay Now"
 * button on narrow viewports, where the summary is no longer a sticky side rail — both
 * delegate to the same `placeOrder` output, matching the mockup's `placeOrderBtnMobile`
 * which just re-clicks `placeOrderBtn` rather than duplicating any logic.
 *
 * Line items here are directly editable (+/- stepper, remove) — the mockup's
 * `checkoutItems` reuses the exact same `cartItemRowHTML` markup/behavior as the cart
 * drawer, so this component talks to `CartService` the same way `CartDrawer` does. The one
 * difference: when BuyNowService has a line set, `lines()`/`subtotal()` reflect that single
 * line instead of the real cart, and edits route to BuyNowService instead — mirrors
 * Checkout's own `lines` computed (see its doc comment) so both components agree on what
 * "the order" means for this visit.
 *
 * `:host { display: contents }` (see order-summary.css) so the `<aside>` lands as a direct
 * child of the parent's `.checkout-grid` and the mobile bar as a direct child of
 * `.page` — matching the mockup's flat DOM structure (the mobile bar is a *sibling*
 * of `.checkout-grid`, not nested inside it) without needing two separate host components.
 */
@Component({
  selector: 'app-order-summary',
  imports: [Icon],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css',
})
export class OrderSummary {
  @Output() readonly placeOrder = new EventEmitter<void>();

  /** True from the moment "Pay Now" is pressed until the order (and, for online payments,
   *  the Razorpay round-trip) resolves. Checkout already refused re-entrant submits, but
   *  nothing on screen said so — the button sat inert and the natural read was that the
   *  click hadn't registered. */
  readonly submitting = input(false);

  /** Drives the CTA copy only. "Pay Now" on a Cash-on-Delivery order promises a payment step
   *  that isn't coming; COD orders say "Place Order" instead. */
  readonly paymentMethod = input<PaymentMethod>('cod');

  protected readonly ctaLabel = computed(() => (this.paymentMethod() === 'online' ? 'Pay Now' : 'Place Order'));

  /** The order can't be placed signed out (CartService/Checkout both gate on it), so the
   *  button says so up front rather than accepting the click and bouncing the shopper to a
   *  sign-in prompt. */
  protected readonly canSubmit = computed(
    () => this.auth.isLoggedIn() && !this.submitting() && this.lines().length > 0
  );

  protected readonly lines = computed(() => {
    const buyNowLine = this.buyNow.line();
    return buyNowLine ? [buyNowLine] : this.cart.lines();
  });

  protected readonly subtotal = computed(() =>
    this.lines().reduce((sum, line) => sum + line.unitPrice * line.qty, 0)
  );

  protected readonly delivery = computed(() => {
    const subtotal = this.subtotal();
    if (subtotal === 0) {
      return 0;
    }
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  });

  protected readonly total = computed(() => this.subtotal() + this.delivery());

  /** Shown as a nudge above the total when the order is close to qualifying — the shopper
   *  otherwise only discovers the free-delivery line by accidentally crossing it. */
  protected readonly amountToFreeDelivery = computed(() =>
    this.subtotal() > 0 ? amountToFreeDelivery(this.subtotal()) : 0
  );

  protected readonly freeDeliveryThreshold = FREE_DELIVERY_THRESHOLD;

  constructor(
    protected readonly cart: CartService,
    protected readonly auth: AuthService,
    private readonly overlay: OverlayService,
    private readonly toast: ToastService,
    private readonly confirmService: ConfirmService,
    private readonly buyNow: BuyNowService
  ) {}

  protected readonly failedImages = signal<Set<string>>(new Set());

  protected onImageError(lineId: string): void {
    const next = new Set(this.failedImages());
    next.add(lineId);
    this.failedImages.set(next);
  }

  protected increment(lineId: string, currentQty: number): void {
    if (this.buyNow.line()?.id === lineId) {
      this.buyNow.setQty(currentQty + 1);
    } else {
      this.cart.setQty(lineId, currentQty + 1);
    }
  }

  protected decrement(lineId: string, currentQty: number): void {
    if (this.buyNow.line()?.id === lineId) {
      this.buyNow.setQty(currentQty - 1);
    } else {
      this.cart.setQty(lineId, currentQty - 1);
    }
  }

  protected async remove(lineId: string): Promise<void> {
    const line = this.lines().find((l) => l.id === lineId);
    if (!line) {
      return;
    }
    const confirmed = await this.confirmService.confirm(`Remove ${line.name} from your order?`, {
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    const isBuyNow = this.buyNow.line()?.id === lineId;
    if (isBuyNow) {
      this.buyNow.clear();
    } else {
      this.cart.remove(lineId);
    }
    this.toast.show(isBuyNow ? `Removed ${line.name}` : `Removed ${line.name} from cart`, 'info');
  }

  protected onPlaceOrderClick(): void {
    this.placeOrder.emit();
  }

  /** Sign-in link inside the auth notice — opens the popover directly, mirroring the
   *  mockup's checkoutSignInLink click handler (and CartDrawer's identical openSignIn()). */
  protected openSignIn(event: MouseEvent): void {
    event.stopPropagation();
    this.overlay.openProfile(null);
  }
}
