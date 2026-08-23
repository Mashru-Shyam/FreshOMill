import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productSlug: string | null;
  name: string;
  imageUrl: string | null;
  variant: string;
  unitPrice: number;
  qty: number;
}

export type OrderStatus = 'PendingPayment' | 'Placed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'PaymentFailed';

export interface AdminOrder {
  id: string;
  placedAt: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/api/v1/admin/orders`;

  list(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(this.base);
  }

  getById(id: string): Observable<AdminOrder> {
    return this.http.get<AdminOrder>(`${this.base}/${id}`);
  }

  updateStatus(id: string, status: OrderStatus): Observable<AdminOrder> {
    return this.http.put<AdminOrder>(`${this.base}/${id}/status`, { status });
  }
}
