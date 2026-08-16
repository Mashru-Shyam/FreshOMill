import { Component, OnDestroy, computed, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AddressForm } from './address-form/address-form';
import { PaymentOptions } from './payment-options/payment-options';
import { OrderSummary } from './order-summary/order-summary';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';
import { OverlayService } from '../../shared/services/overlay.service';
import { OrdersService, type Order } from '../../shared/services/orders.service';
import { PaymentService } from '../../shared/services/payment.service';
import { ToastService } from '../../shared/services/toast.service';
import { BuyNowService } from '../../shared/services/buy-now.service';
import { extractErrorMessage } from '../../shared/util/http-error';
import type { AddressInput } from '../../shared/services/address.service';
import { Icon } from '../../shared/icon/icon';

type ViewState = 'empty' | 'form';

/**
 * Checkout page (Sample/Checkout.html) — ported as a page shell (header + empty/form states)
 * around three focused sub-components: shipping details (`AddressForm`), payment method
 * (`PaymentOptions`), and the order summary rail + sticky mobile bar (`OrderSummary`), so no
 * single component style sheet gets close to the 8kB anyComponentStyle budget.
 *
 * Placing an order shows a toast and returns to /store — no separate inline success panel
 * (deliberately dropped; a full extra page/panel for what's just a confirmation message was
 * more ceremony than the flow needed). For 'online', a Razorpay Checkout widget opens
 * between order placement and that final toast — see handleOrderPlaced().
 */
@Component({
  selector: 'app-checkout-page',
  imports: [RouterLink, AddressForm, PaymentOptions, OrderSummary, Icon],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnDestroy {
  private readonly addressForm = viewChild(AddressForm);
  private readonly paymentOptions = viewChild(PaymentOptions);

  protected readonly submitting = signal(false);

  /** The single Buy Now line when one is set, otherwise the real cart — see
   *  BuyNowService's doc comment. Everything below (view state, place-order) reads through
   *  this instead of `cart.lines()` directly, and OrderSummary computes the same thing
   *  independently for its own item list/subtotal. */
  protected readonly lines = computed(() => {
    const buyNowLine = this.buyNow.line();
    return buyNowLine ? [buyNowLine] : this.cart.lines();
  });

  protected readonly viewState = computed<ViewState>(() => (this.lines().length === 0 ? 'empty' : 'form'));

  constructor(
    protected readonly cart: CartService,
    private readonly auth: AuthService,
    private readonly overlay: OverlayService,
    private readonly orders: OrdersService,
    private readonly payment: PaymentService,
    private readonly toast: ToastService,
    protected readonly buyNow: BuyNowService,
    private readonly router: Router
  ) {}

  /** Buy Now mode must never survive past this page visit — leaving Checkout any way
   *  (back button, "Continue Shopping", a completed order) destroys this component, and
   *  clearing here is what guarantees the next /checkout visit starts from the real cart
   *  again instead of a stale single-item override. */
  ngOnDestroy(): void {
    this.buyNow.clear();
  }

  /** Runs on the order-summary's "Pay Now" click — mirrors the mockup's `placeOrderBtn`
   *  handler: sign-in gate first (defensive — the button is already `disabled` while
   *  logged out, same as the mockup's `placeOrderBtn.disabled = !loggedIn`), then form
   *  validation, then a real `OrdersService.placeOrder()` API call. */
  protected onPlaceOrder(): void {
    if (this.submitting()) {
      return;
    }
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please sign in to place your order.', 'info');
      this.overlay.openProfile(null);
      return;
    }
    const lines = this.lines();
    if (lines.length === 0) {
      return;
    }
    const form = this.addressForm();
    if (!form || !form.validate()) {
      this.toast.show('Please fix the highlighted fields before placing your order.', 'error');
      return;
    }

    const address = form.snapshot();
    const paymentMethod = this.paymentOptions()?.selected() ?? 'cod';
    // Buy Now was never in the real cart, so there's nothing there to clear — only a normal
    // cart-checkout tells the server to empty the persisted cart.
    const isBuyNow = this.buyNow.line() !== null;

    this.submitting.set(true);
    this.orders.placeOrder(lines, address, paymentMethod, !isBuyNow).subscribe({
      next: (order) => this.handleOrderPlaced(order, address, isBuyNow),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.toast.show(extractErrorMessage(error) ?? 'Could not place your order. Please try again.', 'error');
      },
    });
  }

  /** The order row (plus its stock decrement / cart clear) is already committed server-side the
   *  moment placeOrder() resolves, whether or not a payment step follows — so local cart/Buy-Now
   *  cleanup always runs here, then 'online' orders continue into the Razorpay widget while
   *  'cod' orders (no `paymentGateway`) are already done. */
  private handleOrderPlaced(order: Order, address: AddressInput, isBuyNow: boolean): void {
    if (isBuyNow) {
      this.buyNow.clear();
    } else {
      this.cart.refetch();
    }

    if (!order.paymentGateway) {
      this.finishSuccessfully(order, address);
      return;
    }

    this.payment
      .openCheckout(order.paymentGateway, { name: address.fullName, contact: address.phone })
      .then((result) =>
        this.orders.verifyPayment(order.id, result).subscribe({
          next: () => this.finishSuccessfully(order, address),
          error: (error: unknown) => {
            this.submitting.set(false);
            this.toast.show(
              extractErrorMessage(error) ?? 'Payment could not be verified. Check Orders for the current status.',
              'error'
            );
            this.router.navigateByUrl('/orders');
          },
        })
      )
      .catch(() => {
        this.submitting.set(false);
        this.toast.show('Payment was not completed. Your order is saved as pending — check Orders to retry.', 'info');
        this.router.navigateByUrl('/orders');
      });
  }

  private finishSuccessfully(order: Order, address: AddressInput): void {
    this.submitting.set(false);
    this.toast.show(
      `Thanks! Your order #${order.id} has been placed. We'll reach out on ${address.phone} with delivery updates.`,
      'success'
    );
    this.router.navigateByUrl('/store');
  }
}
