import { Component, computed, input, signal } from '@angular/core';
import type { Order, OrderStatus } from '../../../shared/services/orders.service';
import { Icon } from '../../../shared/icon/icon';

interface StatusMeta {
  readonly label: string;
  readonly badgeClass: string;
  readonly icon: string;
}

/**
 * Sample/Orders.html's `ORDER_STATUS_META` only covers 3 states
 * (Processing/Delivered/Cancelled) because the mockup's mock order data
 * never has a "shipped" one; `OrdersService.OrderStatus` has more. 'shipped'
 * and 'pendingpayment' are mapped onto the same warning-toned "processing"
 * badge style as 'placed' (there's no 4th badge variant in the mockup's CSS
 * to reuse), just with their own label and icon; 'paymentfailed' reuses the
 * "cancelled" badge style for the same reason.
 */
const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pendingpayment: { label: 'Payment Pending', badgeClass: 'order-badge--processing', icon: 'clock' },
  placed: { label: 'Processing', badgeClass: 'order-badge--processing', icon: 'loader' },
  shipped: { label: 'Shipped', badgeClass: 'order-badge--processing', icon: 'truck' },
  delivered: { label: 'Delivered', badgeClass: 'order-badge--delivered', icon: 'check-circle' },
  cancelled: { label: 'Cancelled', badgeClass: 'order-badge--cancelled', icon: 'x-circle' },
  paymentfailed: { label: 'Payment Failed', badgeClass: 'order-badge--cancelled', icon: 'alert-circle' },
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
