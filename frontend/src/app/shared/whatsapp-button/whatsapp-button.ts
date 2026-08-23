import { Component, computed, inject } from '@angular/core';
import { Icon } from '../icon/icon';
import { StoreSettingsService } from '../services/store-settings.service';

@Component({
  selector: 'app-whatsapp-button',
  imports: [Icon],
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css',
})
export class WhatsappButton {
  private readonly storeSettings = inject(StoreSettingsService);
  
  protected readonly waLink = computed(
    () => `https://wa.me/${this.storeSettings.settings().whatsAppNumber.replace(/\D/g, '')}`
  );
}
