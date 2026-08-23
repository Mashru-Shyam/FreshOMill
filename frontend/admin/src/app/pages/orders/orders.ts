import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AdminOrder, OrderStatus, OrdersService } from '../../core/services/orders.service';
import { extractErrorMessage } from '../../core/util/http-error';

const ALLOWED_TARGETS: OrderStatus[] = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];

@Component({
  selector: 'app-orders',
  imports: [DatePipe],
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

  constructor() {
    this.refresh();
  }

  private refresh(): void {
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

  protected badgeClass(status: OrderStatus): string {
    switch (status) {
      case 'Delivered':
        return 'badge--success';
      case 'Cancelled':
      case 'PaymentFailed':
        return 'badge--danger';
      case 'PendingPayment':
        return 'badge--warning';
      default:
        return 'badge--neutral';
    }
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
