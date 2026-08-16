import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { extractErrorMessage } from '../util/http-error';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface Address {
  readonly id: string;
  readonly fullName: string;
  readonly phone: string;
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly city: string;
  readonly state: string;
  readonly pincode: string;
  readonly isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'>;

interface AddressDto {
  readonly id: string;
  readonly fullName: string;
  readonly phone: string;
  readonly addressLine1: string;
  readonly addressLine2: string | null;
  readonly city: string;
  readonly state: string;
  readonly pincode: string;
  readonly isDefault: boolean;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly refreshTrigger = signal(0);

  private readonly addresses$ = toObservable(
    computed(() => ({ signedIn: this.auth.isLoggedIn(), tick: this.refreshTrigger() }))
  ).pipe(
    switchMap(({ signedIn }) =>
      signedIn
        ? this.http.get<AddressDto[]>(`${API_BASE_URL}/api/v1/addresses`).pipe(
            map((dtos) => dtos.map(fromDto)),
            catchError(() => of<Address[]>([]))
          )
        : of<Address[]>([])
    )
  );

  readonly addresses = toSignal(this.addresses$, { initialValue: [] as Address[] });

  readonly defaultAddress = computed(() => this.addresses().find((address) => address.isDefault) ?? this.addresses()[0]);

  add(input: AddressInput, makeDefault = false): void {
    this.http
      .post<AddressDto>(`${API_BASE_URL}/api/v1/addresses`, { ...input, makeDefault })
      .subscribe({
        next: () => this.refresh(),
        error: (error: unknown) => this.toast.show(extractErrorMessage(error) ?? 'Could not save address.', 'error'),
      });
  }

  update(id: string, input: AddressInput): void {
    this.http
      .put<AddressDto>(`${API_BASE_URL}/api/v1/addresses/${id}`, input)
      .subscribe({
        next: () => this.refresh(),
        error: (error: unknown) => this.toast.show(extractErrorMessage(error) ?? 'Could not update address.', 'error'),
      });
  }

  remove(id: string): void {
    this.http.delete(`${API_BASE_URL}/api/v1/addresses/${id}`).subscribe({
      next: () => this.refresh(),
      error: (error: unknown) => this.toast.show(extractErrorMessage(error) ?? 'Could not remove address.', 'error'),
    });
  }

  setDefault(id: string): void {
    this.http.post(`${API_BASE_URL}/api/v1/addresses/${id}/default`, {}).subscribe({
      next: () => this.refresh(),
      error: (error: unknown) => this.toast.show(extractErrorMessage(error) ?? 'Could not update default address.', 'error'),
    });
  }

  private refresh(): void {
    this.refreshTrigger.update((n) => n + 1);
  }
}

function fromDto(dto: AddressDto): Address {
  return {
    id: dto.id,
    fullName: dto.fullName,
    phone: dto.phone,
    addressLine1: dto.addressLine1,
    addressLine2: dto.addressLine2 ?? undefined,
    city: dto.city,
    state: dto.state,
    pincode: dto.pincode,
    isDefault: dto.isDefault,
  };
}
