import { Component } from '@angular/core';
import { Icon } from '../icon/icon';

interface TickerItem {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-top-ticker',
  imports: [Icon],
  templateUrl: './top-ticker.html',
  styleUrl: './top-ticker.css',
})
export class TopTicker {
  readonly tickerGroups = [0, 1, 2];
  protected readonly items: TickerItem[] = [
    { icon: 'shield-check', label: 'No Preservatives or Adulterants' },
    { icon: 'package-check', label: 'Freshly Packed on Order' },
    { icon: 'sparkles', label: 'Premium Quality Ingridient' },
    { icon: 'tractor', label: 'Sourced from local farms' },
    { icon: 'droplets', label: 'Washed and Clean' },
  ];
}
