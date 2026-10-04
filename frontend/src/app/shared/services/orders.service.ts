import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, scan, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import type { CartLine } from './cart.service';
import { AuthService } from './auth.service';
import type { RazorpayGatewayInfo, RazorpayPaymentResult } from './payment.service';
import type { LoadStatus } from '../util/load-state';

export type PaymentMethod = 'cod' | 'online';

export type OrderStatus = 'pendingpayment' | 'placed' | 'shipped' | 'delivered' | 'cancelled' | 'paymentfailed';

export interface OrderItem {
  readonly name: string;
  readonly image?: string;
  readonly variant: string;
  readonly unitPrice: number;
  readonly qty: number;
}

export interface OrderShippingAddress {
  readonly fullName: string;
  readonly phone: string;
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly city: string;
  readonly state: string;
  readonly pincode: string;
}

export interface Order {
  readonly id: string;
  readonly placedAt: string;
  readonly status: OrderStatus;
  readonly paymentMethod: PaymentMethod;
  readonly items: OrderItem[];
  readonly total: number;
  readonly address: OrderShippingAddress;
  /** Only present right after placing an online-payment order (status 'pendingpayment') — what
   *  PaymentService.openCheckout() needs to launch the Razorpay widget. */
  readonly paymentGateway?: RazorpayGatewayInfo;
}

interface OrderItemDto {
  readonly productSlug: string | null;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly variant: string;
  readonly unitPrice: number;
  readonly qty: number;
}

interface ShippingAddressDto {
  readonly fullName: string;
  readonly phone: string;
  readonly addressLine1: string;
  readonly addressLine2: string | null;
  readonly city: string;
  readonly state: string;
  readonly pincode: string;
}

interface PaymentGatewayInfoDto {
  readonly keyId: string;
  readonly gatewayOrderId: string;
  readonly currency: string;
  readonly amountInSmallestUnit: number;
}

interface OrderDto {
  readonly id: string;
  readonly placedAt: string;
  /** PascalCase enum name from the backend (e.g. "PendingPayment") — lowercased in fromDto() to
   *  match the frontend's OrderStatus union, which order-card.ts's STATUS_META is keyed on. */
  readonly status: string;
  readonly total: number;
  readonly paymentMethod: string;
  readonly shippingAddress: ShippingAddressDto;
  readonly items: readonly OrderItemDto[];
  readonly paymentGateway: PaymentGatewayInfoDto | null;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly refreshTrigger = signal(0);

  /** Same request and same triggers as before; the extra `status` field is what lets the
   *  Orders page tell "still fetching" apart from "you have no orders", which both used to
   *  render the same empty state. A failed fetch keeps any orders already on screen rather
   *  than blanking the list. */
  private readonly ordersState$ = toObservable(
    computed(() => ({ signedIn: this.auth.isLoggedIn(), tick: this.refreshTrigger() }))
  ).pipe(
    switchMap(({ signedIn }) =>
      signedIn
        ? this.http.get<OrderDto[]>(`${API_BASE_URL}/api/v1/orders`).pipe(
            map((dtos) => ({ orders: dtos.map(fromDto), status: 'ready' as LoadStatus })),
            catchError(() => of({ orders: [] as Order[], status: 'error' as LoadStatus })),
            startWith({ orders: [] as Order[], status: 'loading' as LoadStatus })
          )
        : // Signed out isn't a loading state — the page shows its sign-in gate immediately.
          of({ orders: [] as Order[], status: 'ready' as LoadStatus })
    ),
    scan((previous, next) =>
      next.status === 'error' && previous.orders.length > 0 ? { orders: previous.orders, status: 'ready' as LoadStatus } : next
    ),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  private readonly ordersState = toSignal(this.ordersState$, {
    initialValue: { orders: [] as Order[], status: 'loading' as LoadStatus },
  });

  readonly orders = computed(() => this.ordersState().orders);
  readonly isLoading = computed(() => this.ordersState().status === 'loading');
  readonly isError = computed(() => this.ordersState().status === 'error');

  /** Retry hook for the Orders page's error state. */
  reload(): void {
    this.refreshTrigger.update((n) => n + 1);
  }

  placeOrder(
    lines: readonly CartLine[],
    address: OrderShippingAddress,
    paymentMethod: PaymentMethod,
    clearCart: boolean
  ): Observable<Order> {
    const body = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? null,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      paymentMethod,
      clearCart,
      items: lines.map((line) => ({
        productSlug: line.productId || null,
        name: line.name,
        imageUrl: line.image ?? null,
        variant: line.variant,
        unitPrice: line.unitPrice,
        qty: line.qty,
      })),
    };

    return this.http.post<OrderDto>(`${API_BASE_URL}/api/v1/orders`, body).pipe(
      map(fromDto),
      tap(() => this.refreshTrigger.update((n) => n + 1))
    );
  }

  verifyPayment(orderId: string, result: RazorpayPaymentResult): Observable<Order> {
    const body = {
      razorpayOrderId: result.razorpayOrderId,
      razorpayPaymentId: result.razorpayPaymentId,
      razorpaySignature: result.razorpaySignature,
    };
    return this.http.post<OrderDto>(`${API_BASE_URL}/api/v1/orders/${orderId}/payment/verify`, body).pipe(
      map(fromDto),
      tap(() => this.refreshTrigger.update((n) => n + 1))
    );
  }
}

function fromDto(dto: OrderDto): Order {
  return {
    id: dto.id,
    placedAt: dto.placedAt,
    status: dto.status.toLowerCase() as OrderStatus,
    paymentMethod: dto.paymentMethod.toLowerCase() as PaymentMethod,
    total: dto.total,
    address: {
      fullName: dto.shippingAddress.fullName,
      phone: dto.shippingAddress.phone,
      addressLine1: dto.shippingAddress.addressLine1,
      addressLine2: dto.shippingAddress.addressLine2 ?? undefined,
      city: dto.shippingAddress.city,
      state: dto.shippingAddress.state,
      pincode: dto.shippingAddress.pincode,
    },
    items: dto.items.map((item) => ({
      name: item.name,
      image: item.imageUrl ?? undefined,
      variant: item.variant,
      unitPrice: item.unitPrice,
      qty: item.qty,
    })),
    paymentGateway: dto.paymentGateway
      ? {
          keyId: dto.paymentGateway.keyId,
          gatewayOrderId: dto.paymentGateway.gatewayOrderId,
          currency: dto.paymentGateway.currency,
          amountInSmallestUnit: dto.paymentGateway.amountInSmallestUnit,
        }
      : undefined,
  };
}
