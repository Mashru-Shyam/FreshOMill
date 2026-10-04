import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../shared/services/orders.service';
import { AuthService } from '../../shared/services/auth.service';
import { OverlayService } from '../../shared/services/overlay.service';
import { Icon } from '../../shared/icon/icon';
import { OrderCard } from './order-card/order-card';

/**
 * Orders page (Sample/Orders.html) — a read-only history of everything
 * `OrdersService` has recorded, newest first. Three states, mirroring the
 * mockup's `renderOrdersPage()`:
 *  1. signed-out — `.empty-state` sign-in gate (mockup's `#ordersSignedOut`);
 *  2. signed-in with no orders yet — `.empty-state` empty state
 *     (`#ordersEmpty`), CTA to /store;
 *  3. signed-in with orders — `.orders-list` of `<app-order-card>`, one per
 *     `OrdersService.orders()` entry (already newest-first from the service).
 *
 * The mockup's cards aren't links/expandable — `orderCardHTML()` renders a
 * flat, non-interactive `<section>` — so this stays a flat list too; no
 * order-detail route was added.
 */
@Component({
  selector: 'app-orders-page',
  imports: [RouterLink, OrderCard, Icon],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  /** Placeholder cards while the history loads — the page used to render "No orders yet"
   *  during that window, which reads as a factual (and wrong) statement about the account. */
  protected readonly skeletonSlots = Array.from({ length: 2 }, (_, i) => i);

  constructor(
    protected readonly orders: OrdersService,
    protected readonly auth: AuthService,
    private readonly overlay: OverlayService
  ) {}

  /** Opens the sign-in popover un-anchored, same documented pattern as
   *  CartDrawer.openSignIn() — there's no stable navbar button reference from here. */
  protected openSignIn(event: MouseEvent): void {
    event.stopPropagation();
    this.overlay.openProfile(null);
  }
}
