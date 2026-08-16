import { Component, signal } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';
import type { PaymentMethod } from '../../../shared/services/orders.service';

/**
 * Payment method picker (Sample/Checkout.html's "Payment method" `.payment-options` radio
 * cards) — two choices: Cash on Delivery, or Pay Online via Razorpay. Razorpay's own Checkout
 * widget is what actually lets the shopper pick UPI/Card/Netbanking within "online", so this
 * picker doesn't need to split that out itself.
 *
 * `selected()` feeds `OrdersService.placeOrder()`'s `paymentMethod` param.
 */
@Component({
  selector: 'app-payment-options',
  imports: [Icon],
  templateUrl: './payment-options.html',
  styleUrl: './payment-options.css',
})
export class PaymentOptions {
  protected readonly method = signal<PaymentMethod>('cod');

  protected select(method: PaymentMethod): void {
    this.method.set(method);
  }

  selected(): PaymentMethod {
    return this.method();
  }
}
