import { Component, ElementRef, HostListener, computed, input, output, signal, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';
import { INDIAN_STATES } from '../data/states';

@Component({
  selector: 'app-state-select',
  imports: [Icon],
  templateUrl: './state-select.html',
  styleUrl: './state-select.css',
})
export class StateSelect {
  readonly value = input('');
  readonly invalid = input(false);
  readonly valueChange = output<string>();

  protected readonly menuOpen = signal(false);
  protected readonly query = signal('');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly states = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? INDIAN_STATES.filter((s) => s.toLowerCase().includes(q)) : INDIAN_STATES;
  });

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  protected toggleMenu(): void {
    const opening = !this.menuOpen();
    this.menuOpen.set(opening);
    if (opening) {
      this.query.set('');
      queueMicrotask(() => this.searchInput()?.nativeElement.focus());
    }
  }

  protected onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected select(state: string): void {
    this.valueChange.emit(state);
    this.menuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }
}
