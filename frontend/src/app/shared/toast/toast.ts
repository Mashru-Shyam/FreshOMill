import { Component } from '@angular/core';
import { ToastService, ToastType } from '../services/toast.service';
import { Icon } from '../icon/icon';

const ICON_BY_TYPE: Record<ToastType, string> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'info',
};

@Component({
  selector: 'app-toast',
  imports: [Icon],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast {
  constructor(protected readonly toastService: ToastService) {}

  protected iconFor(type: ToastType): string {
    return ICON_BY_TYPE[type];
  }
}
