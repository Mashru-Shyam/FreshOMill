import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService, isValidEmail } from '../../core/services/admin-auth.service';
import { extractErrorMessage } from '../../core/util/http-error';

type AuthStep = 'email' | 'otp';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  protected readonly step = signal<AuthStep>('email');
  protected readonly email = signal('');
  protected readonly otp = signal('');
  protected readonly pendingEmail = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  private challengeId: string | null = null;

  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.error.set(null);
  }

  protected onOtpInput(event: Event): void {
    this.otp.set((event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6));
    this.error.set(null);
  }

  protected onSubmit(): void {
    if (this.submitting()) {
      return;
    }
    if (this.step() === 'email') {
      this.submitEmail();
    } else {
      this.submitOtp();
    }
  }

  private submitEmail(): void {
    const email = this.email().trim();
    if (!isValidEmail(email)) {
      this.error.set('Enter a valid email address.');
      return;
    }

    this.submitting.set(true);
    this.auth.requestOtp(email).subscribe({
      next: (result) => {
        this.pendingEmail.set(email);
        this.challengeId = result.challengeId;
        this.otp.set('');
        this.step.set('otp');
        this.submitting.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Could not send a code. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  private submitOtp(): void {
    const value = this.otp().trim();
    if (!/^\d{6}$/.test(value)) {
      this.error.set('Enter the 6-digit code.');
      return;
    }
    if (!this.challengeId) {
      this.error.set('That code has expired. Please request a new one.');
      this.step.set('email');
      return;
    }

    this.submitting.set(true);
    this.auth.verifyOtp(this.challengeId, value).subscribe({
      next: (user) => {
        this.submitting.set(false);
        if (user.role !== 'Admin') {
          this.error.set('This account does not have admin access.');
          this.auth.logout();
          return;
        }
        this.router.navigateByUrl('/products');
      },
      error: (err: unknown) => {
        this.error.set(extractErrorMessage(err) ?? 'Incorrect code. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
