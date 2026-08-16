import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface ContactMessageInput {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  submit(input: ContactMessageInput): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/api/v1/contact`, {
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      message: input.message,
    });
  }
}
