import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface StoreSettings {
  address: string;
  phone: string;
  whatsAppNumber: string;
  email: string;
  openingHours: string;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  linkedInUrl: string | null;
  googleMapsUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);

  get(): Observable<StoreSettings> {
    return this.http.get<StoreSettings>(`${API_BASE_URL}/api/v1/store-settings`);
  }

  update(settings: StoreSettings): Observable<StoreSettings> {
    return this.http.put<StoreSettings>(`${API_BASE_URL}/api/v1/admin/store-settings`, settings);
  }
}
