import { Component, signal } from '@angular/core';
import { AddressService, type AddressInput } from '../../../shared/services/address.service';
import { validateAddressFields } from '../../../shared/util/address-validation';
import { StateSelect } from '../../../shared/state-select/state-select';

/**
 * Shipping details form (Sample/Checkout.html's "Shipping details" `.checkout-section` —
 * full name, phone, address line, apartment/suite, city, state, pincode).
 *
 * A disposable, in-page form — it doesn't go through AddressService at all (that service's
 * own doc comment says as much: Checkout's form only needs to join the address book if the
 * shopper explicitly chooses to save it, and the mockup has no "save this address" control,
 * so this port doesn't add one either). It's prefilled once from
 * `AddressService.defaultAddress()`, if one exists, mirroring the mockup's
 * `prefillShippingFromProfile()` — never overwrites a field after the initial fill. The
 * mockup never shows an address *picker* even though a saved-address book exists elsewhere
 * (Profile.html), so this component doesn't build one either — always the same flat form.
 */
@Component({
  selector: 'app-address-form',
  imports: [StateSelect],
  templateUrl: './address-form.html',
  styleUrl: './address-form.css',
})
export class AddressForm {
  protected readonly fullName = signal('');
  protected readonly phone = signal('');
  protected readonly addressLine1 = signal('');
  protected readonly addressLine2 = signal('');
  protected readonly city = signal('');
  protected readonly state = signal('');
  protected readonly pincode = signal('');

  protected readonly fieldErrors = signal<Record<string, string>>({});

  constructor(addresses: AddressService) {
    const saved = addresses.defaultAddress();
    if (!saved) {
      return;
    }
    this.fullName.set(saved.fullName);
    this.phone.set(saved.phone);
    this.addressLine1.set(saved.addressLine1);
    this.addressLine2.set(saved.addressLine2 ?? '');
    this.city.set(saved.city);
    this.state.set(saved.state);
    this.pincode.set(saved.pincode);
  }

  protected isInvalid(field: string): boolean {
    return field in this.fieldErrors();
  }

  protected errorFor(field: string): string | undefined {
    return this.fieldErrors()[field];
  }

  /** Validates required fields plus phone/pincode format (mirrors `checkoutValidateForm()`,
   *  extended with the digit-count checks the mockup never had) — apartment/suite stays
   *  optional — and returns whether the whole form passed. */
  validate(): boolean {
    const errors = validateAddressFields({
      fullName: this.fullName(),
      phone: this.phone(),
      addressLine1: this.addressLine1(),
      city: this.city(),
      state: this.state(),
      pincode: this.pincode(),
    });
    this.fieldErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /** Snapshot of the current field values, shaped for `OrdersService.placeOrder()`'s
   *  `Address` parameter — the caller fills in `id`/`isDefault` since this form isn't a
   *  saved-address-book entry. */
  snapshot(): AddressInput {
    return {
      fullName: this.fullName().trim(),
      phone: this.phone().trim(),
      addressLine1: this.addressLine1().trim(),
      addressLine2: this.addressLine2().trim() || undefined,
      city: this.city().trim(),
      state: this.state().trim(),
      pincode: this.pincode().trim(),
    };
  }
}
