import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AdminOrder, OrderStatus, OrdersService } from '../../core/services/orders.service';
import { extractErrorMessage } from '../../core/util/http-error';
import { DialogFocus } from '../../core/util/dialog-focus.directive';
import { EmptyState, TableSkeleton } from '../../shared/states/table-states';

const ALLOWED_TARGETS: OrderStatus[] = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];

/** Every state an order can be in — the filter needs the full set, not just the four an
 *  operator is allowed to transition *to* (ALLOWED_TARGETS), since PendingPayment and
 *  PaymentFailed orders still show up in the list and are worth filtering for. */
const ALL_STATUSES: OrderStatus[] = [
  'PendingPayment', 'Placed', 'Shipped', 'Delivered', 'Cancelled', 'PaymentFailed',
];

@Component({
  selector: 'app-orders',
  imports: [DatePipe, DialogFocus, EmptyState, TableSkeleton],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  private readonly ordersService = inject(OrdersService);

  protected readonly orders = signal<AdminOrder[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly selected = signal<AdminOrder | null>(null);
  protected readonly updatingStatus = signal(false);
  protected readonly statusError = signal<string | null>(null);

  protected readonly allowedTargets = ALLOWED_TARGETS;
  protected readonly allStatuses = ALL_STATUSES;

  /** Client-side over the already-loaded list — see the same note on Products. */
  protected readonly search = signal('');
  protected readonly statusFilter = signal<OrderStatus | ''>('');

  protected readonly filtersActive = computed(
    () => this.search().trim() !== '' || this.statusFilter() !== ''
  );

  protected readonly filteredOrders = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.orders().filter((order) => {
      if (status && order.status !== status) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        order.customerEmail.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term) ||
        order.shippingAddress.fullName.toLowerCase().includes(term) ||
        order.shippingAddress.phone.includes(term)
      );
    });
  });

  constructor() {
    this.refresh();
  }

  protected clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
  }

  /** Also the header's Refresh button and the error state's Retry — a failed load used to
   *  leave a red banner with no way to try again. */
  protected refresh(): void {
    this.error.set(null);
    this.loading.set(true);
    this.ordersService.list().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Could not load orders.');
        this.loading.set(false);
      },
    });
  }

  protected open(order: AdminOrder): void {
    this.statusError.set(null);
    this.selected.set(order);
  }

  protected close(): void {
    this.selected.set(null);
  }

  /** Presentation only — each stage gets its own hue (amber → blue → teal → green, red for
   *  failures) so the Status column is scannable. Placed and Shipped both used to render the
   *  same grey "neutral" chip, which made an unshipped order indistinguishable from a shipped
   *  one at a glance. */
  protected badgeClass(status: OrderStatus): string {
    switch (status) {
      case 'Delivered':
        return 'badge--success';
      case 'Cancelled':
      case 'PaymentFailed':
        return 'badge--danger';
      case 'PendingPayment':
        return 'badge--warning';
      case 'Shipped':
        return 'badge--info';
      case 'Placed':
        return 'badge--primary';
      default:
        return 'badge--neutral';
    }
  }

  /** "cod"/"online" are the wire values; neither is a phrase an operator should have to read
   *  in a table cell. Display-side only. */
  protected paymentLabel(method: string): string {
    return method.toLowerCase() === 'online' ? 'Online' : 'Cash on delivery';
  }

  /** Splits the PascalCase status into words for display ("PendingPayment" → "Pending
   *  Payment"). Display-side only; the underlying value the API sees is unchanged. */
  protected statusLabel(status: OrderStatus): string {
    return status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  protected updateStatus(order: AdminOrder, status: OrderStatus): void {
    if (status === order.status) {
      return;
    }
    this.updatingStatus.set(true);
    this.statusError.set(null);
    this.ordersService.updateStatus(order.id, status).subscribe({
      next: (updated) => {
        this.selected.set(updated);
        this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
        this.updatingStatus.set(false);
      },
      error: (err: unknown) => {
        this.statusError.set(extractErrorMessage(err) ?? 'Could not update order status.');
        this.updatingStatus.set(false);
      },
    });
  }
}
