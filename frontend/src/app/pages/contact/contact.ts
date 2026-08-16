import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { isValidEmail } from '../../shared/services/auth.service';
import { ContactService } from '../../shared/services/contact.service';
import { extractErrorMessage } from '../../shared/util/http-error';
import { Icon } from '../../shared/icon/icon';

/**
 * Contact page (Sample/Contact.html, everything below the shared
 * navbar/search chrome). Ports the hero, the four contact-info rows
 * (address/hours/email/WhatsApp) and the message form.
 *
 * Validates the required fields (name, email, message — phone is optional) client-side same as
 * the original mock did, then submits to POST /api/v1/contact (ContactService) before swapping
 * to the success state. That success state reuses the global
 * `.checkout-success`/`__icon`/`__title`/`__text` classes verbatim, exactly like the mockup
 * itself does (its `.contact-form__success` wrapper still uses
 * `checkout-success__title`/`__text` for the text).
 */
@Component({
  selector: 'app-contact-page',
  imports: [Icon],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly phone = signal('');
  protected readonly message = signal('');

  protected readonly nameInvalid = signal(false);
  protected readonly emailInvalid = signal(false);
  protected readonly messageInvalid = signal(false);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly submitted = signal(false);

  constructor(private readonly contact: ContactService) {}

  @ViewChild('nameInput') private readonly nameInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') private readonly emailInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('messageInput') private readonly messageInputRef?: ElementRef<HTMLTextAreaElement>;

  protected onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
    this.nameInvalid.set(false);
  }

  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.emailInvalid.set(false);
  }

  protected onPhoneInput(event: Event): void {
    this.phone.set((event.target as HTMLInputElement).value);
  }

  protected onMessageInput(event: Event): void {
    this.message.set((event.target as HTMLTextAreaElement).value);
    this.messageInvalid.set(false);
  }

  protected onSubmit(): void {
    if (this.submitting()) {
      return;
    }

    const nameEmpty = this.name().trim() === '';
    const emailValue = this.email().trim();
    const emailEmpty = emailValue === '';
    const messageEmpty = this.message().trim() === '';
    const emailBad = !emailEmpty && !isValidEmail(emailValue);

    this.nameInvalid.set(nameEmpty);
    this.emailInvalid.set(emailEmpty || emailBad);
    this.messageInvalid.set(messageEmpty);

    if (nameEmpty) {
      this.nameInputRef?.nativeElement.focus();
      return;
    }
    if (emailEmpty || emailBad) {
      this.emailInputRef?.nativeElement.focus();
      return;
    }
    if (messageEmpty) {
      this.messageInputRef?.nativeElement.focus();
      return;
    }

    this.submitError.set(null);
    this.submitting.set(true);
    this.contact
      .submit({
        name: this.name().trim(),
        email: emailValue,
        phone: this.phone().trim() || undefined,
        message: this.message().trim(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.submitError.set(extractErrorMessage(error) ?? 'Could not send your message. Please try again.');
        },
      });
  }
}
