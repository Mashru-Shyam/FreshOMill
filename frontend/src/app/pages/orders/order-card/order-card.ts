import { Component, computed, input, signal } from '@angular/core';
import type { Order, OrderStatus } from '../../../shared/services/orders.service';
import { Icon } from '../../../shared/icon/icon';

interface StatusMeta {
  readonly label: string;
  readonly badgeClass: string;
  readonly icon: string;
}

/**
 * Presentation mapping for each order state. Uses the app-wide `.status-badge--*` scale
 * (src/styles.css), which gives every stage its own hue — amber (awaiting payment) → blue
 * (processing) → teal (shipped) → green (delivered), red for the two failure states. The
 * three in-progress states previously all rendered the same blue badge, so a shopper
 * couldn't tell "Processing" from "Shipped" without reading the label.
 */
const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pendingpayment: { label: 'Payment Pending', badgeClass: 'status-badge--pending', icon: 'clock' },
  placed: { label: 'Processing', badgeClass: 'status-badge--processing', icon: 'loader' },
  shipped: { label: 'Shipped', badgeClass: 'status-badge--shipped', icon: 'truck' },
  delivered: { label: 'Delivered', badgeClass: 'status-badge--delivered', icon: 'check-circle' },
  cancelled: { label: 'Cancelled', badgeClass: 'status-badge--cancelled', icon: 'x-circle' },
  paymentfailed: { label: 'Payment Failed', badgeClass: 'status-badge--cancelled', icon: 'alert-circle' },
};

/**
 * One order history card (Sample/Orders.html's `orderCardHTML()` /
 * `.order-card`) — split out of the Orders page itself purely to keep
 * orders.css (page shell) and this file's CSS each well under the
 * anyComponentStyle budget rather than one large combined stylesheet.
 *
 * Item rows reuse the cart-item visual pattern (photo tile + name/variant/
 * qty/price) but under their own `.order-card__item*` classes rather than
 * importing CartDrawer's `.cart-item` — Angular's per-component style
 * encapsulation means there'd be no actual collision either way, but a
 * distinct name keeps this component's stylesheet self-contained without
 * an implicit dependency on another feature's class names.
 *
 * `OrdersService.Order` has no `deliveredAt` timestamp (only `placedAt`),
 * unlike the mockup's mock data — so the delivered note here reads simply
 * "Delivered" instead of the mockup's "Delivered on <date>". Flagged as a
 * gap rather than worked around by guessing a date.
 */
@Component({
  selector: 'app-order-card',
  imports: [Icon],
  templateUrl: './order-card.html',
  styleUrl: './order-card.css',
})
export class OrderCard {
  readonly order = input.required<Order>();

  protected readonly statusMeta = computed<StatusMeta>(() => STATUS_META[this.order().status]);

  /** Name plus the locality — the whole address line would wrap to three lines in a card
   *  that's meant to be scanned, and the name plus city is what distinguishes one saved
   *  address from another. */
  protected readonly shipTo = computed(() => {
    const address = this.order().address;
    return `${address.fullName} · ${address.city}, ${address.state} ${address.pincode}`;
  });

  protected readonly itemCount = computed(() => this.order().items.reduce((sum, item) => sum + item.qty, 0));

  protected readonly formattedDate = computed(() =>
    new Date(this.order().placedAt).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  );

  protected readonly failedImages = signal<Set<string>>(new Set());

  protected onImageError(key: string): void {
    const next = new Set(this.failedImages());
    next.add(key);
    this.failedImages.set(next);
  }
}
