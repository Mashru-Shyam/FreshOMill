import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, shareReplay, switchMap, timer } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

/** Same reasoning/cadence as ProductService's REFRESH_INTERVAL_MS. */
const REFRESH_INTERVAL_MS = 15_000;

export interface StoreSettings {
  readonly address: string;
  readonly phone: string;
  readonly whatsAppNumber: string;
  readonly email: string;
  readonly openingHours: string;
  readonly instagramUrl: string | null;
  readonly youtubeUrl: string | null;
  readonly linkedInUrl: string | null;
  readonly googleMapsUrl: string | null;
}

/** Single source of truth for the contact/social info that used to be hardcoded independently
 *  in the navbar, footer, Contact page, and WhatsApp button — see the Admin Panel's Settings
 *  screen, which is where these are edited now instead of a code change. `initialValue` is a
 *  reasonable fallback (matches what was previously hardcoded) so those components never
 *  render broken links during the brief window before this fetch resolves, or if it fails. */
@Injectable({ providedIn: 'root' })
export class StoreSettingsService {
  private readonly http = inject(HttpClient);

  private static readonly fallback: StoreSettings = {
    address: 'Freshomill, GF - 3/4, Nexus Complex, Near Spring Retreat 4, White House Lane, Bhayli TP 1, Vasna Bhayli Road, Vadodara',
    phone: '+91 76000 62637',
    whatsAppNumber: '+917600062637',
    email: 'mashrushyam37@gmail.com',
    openingHours: 'Everyday: 9:30 AM - 8:00 PM',
    instagramUrl: 'https://instagram.com/freshomill',
    youtubeUrl: 'https://youtube.com/@freshomill',
    linkedInUrl: 'https://linkedin.com/company/freshomill',
    googleMapsUrl: 'https://maps.app.goo.gl/b6igQ81rRruLUmxC6',
  };

  private readonly settings$ = timer(0, REFRESH_INTERVAL_MS).pipe(
    switchMap(() => this.http.get<StoreSettings>(`${API_BASE_URL}/api/v1/store-settings`)),
    catchError(() => of(StoreSettingsService.fallback)),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  readonly settings = toSignal(this.settings$, { initialValue: StoreSettingsService.fallback });
}
