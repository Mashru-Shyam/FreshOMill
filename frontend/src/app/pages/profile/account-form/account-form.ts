import { Component, signal } from '@angular/core';
import { AddressInput, AddressService } from '../../../shared/services/address.service';
import { ToastService } from '../../../shared/services/toast.service';
import { validateAddressFields } from '../../../shared/util/address-validation';
import { Icon } from '../../../shared/icon/icon';
import { StateSelect } from '../../../shared/state-select/state-select';

/**
 * Profile page's "Basic Information" form (Sample/Profile.html) — full
 * name, phone, and delivery address fields (address/apartment/city/state/
 * pincode), exactly the fields the mockup ships (`PROFILE_FIELD_IDS` in its
 * end-of-body script), none of them marked `required` there either, so this
 * port doesn't add validation the mockup never had.
 *
 * Deviation: the mockup persists these fields to their own flat
 * `PROFILE_STORAGE_KEY` record, entirely separate from its saved-address
 * concept (Checkout.html's own delivery form is disposable and unrelated).
 * This port instead treats the form as AddressService's *default* address
 * editor — add() the first time (with no addresses saved yet), update()
 * the existing default afterwards — since AddressService's own doc comment
 * names Profile as where addresses get "managed", and Checkout can then
 * prefill/select from the exact same store. Field-for-field the form is
 * unchanged from the mockup; only what it saves *to* differs.
 */
@Component({
  selector: 'app-account-form',
  imports: [Icon, StateSelect],
  templateUrl: './account-form.html',
  styleUrl: './account-form.css',
})
export class AccountForm {
  protected readonly fieldErrors = signal<Record<string, string>>({});
  /** Unlike the other fields (plain native inputs, read straight off the DOM via template
   *  ref on save), `<app-state-select>` isn't a native form control, so it needs an actual
   *  tracked value — seeded once from the default address, same "never overwrites after the
   *  initial fill" rule Checkout's AddressForm documents for its own fields. */
  protected readonly state = signal('');

  constructor(
    private readonly addressService: AddressService,
    private readonly toast: ToastService
  ) {
    this.state.set(this.addressService.defaultAddress()?.state ?? '');
  }

  protected get defaultAddress() {
    return this.addressService.defaultAddress();
  }

  protected isInvalid(field: string): boolean {
    return field in this.fieldErrors();
  }

  protected errorFor(field: string): string | undefined {
    return this.fieldErrors()[field];
  }

  /** Reads straight off the template-ref'd inputs on click, same as the mockup's
   *  profileSaveBtn handler reading each field by id rather than via ngModel/reactive forms. */
  protected save(
    fullName: HTMLInputElement,
    phone: HTMLInputElement,
    addressLine1: HTMLInputElement,
    addressLine2: HTMLInputElement,
    city: HTMLInputElement,
    pincode: HTMLInputElement
  ): void {
    const input: AddressInput = {
      fullName: fullName.value.trim(),
      phone: phone.value.trim(),
      addressLine1: addressLine1.value.trim(),
      addressLine2: addressLine2.value.trim() || undefined,
      city: city.value.trim(),
      state: this.state().trim(),
      pincode: pincode.value.trim(),
    };

    const errors = validateAddressFields(input);
    this.fieldErrors.set(errors);
    if (Object.keys(errors).length > 0) {
      this.toast.show('Please fix the highlighted fields.', 'error');
      return;
    }

    const existing = this.addressService.defaultAddress();
    if (existing) {
      this.addressService.update(existing.id, input);
    } else {
      this.addressService.add(input, true);
    }

    this.toast.show('Profile details saved.', 'success');
  }
}
