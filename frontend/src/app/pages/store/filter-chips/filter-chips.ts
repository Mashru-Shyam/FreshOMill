import { Component, input, output } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';

export interface AppliedFilterChip {
  readonly key: string;
  readonly label: string;
}

/**
 * Applied filters as removable chips + "clear all" (Sample/Store.html's `#activeFilterChips`)
 * — RF-03's guardrail: collapsing filters into a toolbar/sheet must never hide what's
 * currently applied. Renders nothing when `chips` is empty (mirrors the mockup's `[hidden]`
 * on the whole row).
 */
@Component({
  selector: 'app-filter-chips',
  imports: [Icon],
  templateUrl: './filter-chips.html',
  styleUrl: './filter-chips.css',
})
export class FilterChips {
  readonly chips = input<AppliedFilterChip[]>([]);
  readonly remove = output<string>();
  readonly clearAll = output<void>();
}
