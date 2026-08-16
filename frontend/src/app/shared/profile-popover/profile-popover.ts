import { Component, ElementRef, HostListener, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OverlayService } from '../services/overlay.service';
import { AuthService, isValidEmail } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { extractErrorMessage } from '../util/http-error';
import { Icon } from '../icon/icon';

type AuthStep = 'email' | 'otp';

@Component({
  selector: 'app-profile-popover',
  imports: [RouterLink, Icon],
  templateUrl: './profile-popover.html',
  styleUrl: './profile-popover.css',
})
export class ProfilePopover {
  protected readonly authStep = signal<AuthStep>('email');
  protected readonly emailValue = signal('');
  protected readonly otpValue = signal('');
  protected readonly pendingEmail = signal('');
  protected readonly authError = signal<string | null>(null);
  protected readonly submitting = signal(false);

  private readonly challengeId = signal<string | null>(null);

  constructor(
    protected readonly overlay: OverlayService,
    protected readonly auth: AuthService,
    private readonly toast: ToastService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {
    effect(() => {
      const open = this.overlay.profileOpen();
      if (!open) {
        return;
      }
      if (!this.auth.isLoggedIn()) {
        this.authStep.set('email');
        this.emailValue.set('');
        this.otpValue.set('');
        this.challengeId.set(null);
        this.authError.set(null);
      }
    });
  }

  protected close(): void {
    this.overlay.closeProfile();
  }

  protected logout(): void {
    this.auth.logout();
    this.overlay.closeProfile();
    this.toast.show('Signed out.', 'info');
  }

  protected onEmailInput(event: Event): void {
    this.emailValue.set((event.target as HTMLInputElement).value);
    this.authError.set(null);
  }

  protected onOtpInput(event: Event): void {
    const digitsOnly = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
    this.otpValue.set(digitsOnly);
    this.authError.set(null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }

  protected onSubmit(): void {
    if (this.submitting()) {
      return;
    }
    if (this.authStep() === 'email') {
      this.submitEmail();
    } else {
      this.submitOtp();
    }
  }

  private submitEmail(): void {
    const email = this.emailValue().trim();
    if (!isValidEmail(email)) {
      this.authError.set('Enter a valid email address.');
      return;
    }

    this.submitting.set(true);
    this.auth.requestOtp(email).subscribe({
      next: (result) => {
        this.pendingEmail.set(email);
        this.challengeId.set(result.challengeId);
        this.otpValue.set('');
        this.authError.set(null);
        this.authStep.set('otp');
        this.submitting.set(false);
      },
      error: (error: unknown) => {
        this.authError.set(extractErrorMessage(error) ?? 'Could not send a code. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  private submitOtp(): void {
    const value = this.otpValue().trim();
    if (!/^\d{6}$/.test(value)) {
      this.authError.set('Enter the 6-digit code.');
      return;
    }

    const challengeId = this.challengeId();
    if (!challengeId) {
      this.authError.set('That code has expired. Please request a new one.');
      this.authStep.set('email');
      return;
    }

    this.submitting.set(true);
    this.auth.verifyOtp(challengeId, value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.overlay.closeProfile();
        this.toast.show('Signed in successfully.', 'success');
      },
      error: (error: unknown) => {
        this.authError.set(extractErrorMessage(error) ?? 'Incorrect code. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.overlay.justOpenedProfile) {    
      return;
    }
    if (this.overlay.profileOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.overlay.closeProfile();
    }
  }
}
