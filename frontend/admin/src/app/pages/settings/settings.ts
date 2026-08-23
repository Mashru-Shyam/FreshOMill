import { Component, inject, signal } from '@angular/core';
import { SettingsService, StoreSettings } from '../../core/services/settings.service';
import { extractErrorMessage } from '../../core/util/http-error';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly settingsService = inject(SettingsService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saved = signal(false);

  protected readonly address = signal('');
  protected readonly phone = signal('');
  protected readonly whatsAppNumber = signal('');
  protected readonly email = signal('');
  protected readonly openingHours = signal('');
  protected readonly instagramUrl = signal('');
  protected readonly youtubeUrl = signal('');
  protected readonly linkedInUrl = signal('');
  protected readonly googleMapsUrl = signal('');

  constructor() {
    this.settingsService.get().subscribe({
      next: (settings) => {
        this.address.set(settings.address);
        this.phone.set(settings.phone);
        this.whatsAppNumber.set(settings.whatsAppNumber);
        this.email.set(settings.email);
        this.openingHours.set(settings.openingHours);
        this.instagramUrl.set(settings.instagramUrl ?? '');
        this.youtubeUrl.set(settings.youtubeUrl ?? '');
        this.linkedInUrl.set(settings.linkedInUrl ?? '');
        this.googleMapsUrl.set(settings.googleMapsUrl ?? '');
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Could not load settings.');
        this.loading.set(false);
      },
    });
  }

  protected save(): void {
    const settings: StoreSettings = {
      address: this.address().trim(),
      phone: this.phone().trim(),
      whatsAppNumber: this.whatsAppNumber().trim(),
      email: this.email().trim(),
      openingHours: this.openingHours().trim(),
      instagramUrl: this.instagramUrl().trim() || null,
      youtubeUrl: this.youtubeUrl().trim() || null,
      linkedInUrl: this.linkedInUrl().trim() || null,
      googleMapsUrl: this.googleMapsUrl().trim() || null,
    };

    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);
    this.settingsService.update(settings).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Could not save settings.');
        this.saving.set(false);
      },
    });
  }
}
