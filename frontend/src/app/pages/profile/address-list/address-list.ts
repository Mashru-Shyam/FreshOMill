import { Component, computed, signal } from '@angular/core';
import { Address, AddressInput, AddressService } from '../../../shared/services/address.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { validateAddressFields } from '../../../shared/util/address-validation';
import { Icon } from '../../../shared/icon/icon';
import { StateSelect } from '../../../shared/state-select/state-select';

type FormMode = 'add' | 'edit' | null;

/**
 * "Saved Addresses" section — has no equivalent in Sample/Profile.html (see
 * the deviation note on profile.ts): the mockup only ever edits one
 * implicit address via its "Basic Information" form. This section exists
 * because AddressService is a full list store (used by Checkout to offer a
 * choice of saved addresses), so once more than one address exists there
 * needs to be somewhere on Profile to view, edit, remove, or promote them
 * to default — exercising the rest of AddressService's API
 * (add/update/remove/setDefault) that account-form's single-record editor
 * doesn't touch on its own.
 *
 * Add and Edit reuse the exact same field set/markup (name/phone/address
 * line 1/line 2/city/state/pincode, matching account-form's fields
 * one-for-one) — only the submit handler branches on `formMode`.
 */
@Component({
  selector: 'app-address-list',
  imports: [Icon, StateSelect],
  templateUrl: './address-list.html',
  styleUrl: './address-list.css',
})
export class AddressList {
  protected readonly formMode = signal<FormMode>(null);
  private readonly editingId = signal<string | null>(null);
  protected readonly fieldErrors = signal<Record<string, string>>({});
  /** Unlike the other fields (plain native inputs, read straight off the DOM via template
   *  ref on submit), `<app-state-select>` isn't a native form control, so it needs an
   *  actual tracked value — reset in startAdd()/startEdit() below, same lifecycle as
   *  `fieldErrors`. */
  protected readonly state = signal('');
  /** True once any field in the open add/edit form has been touched — gates the discard
   *  confirmation in cancelForm() so cancelling an untouched form doesn't prompt for nothing. */
  protected readonly formDirty = signal(false);

  protected readonly addresses = computed(() => this.addressService.addresses());
  protected readonly editingAddress = computed(
    () => this.addresses().find((a) => a.id === this.editingId()) ?? null
  );

  constructor(
    private readonly addressService: AddressService,
    private readonly toast: ToastService,
    private readonly confirmService: ConfirmService
  ) {}

  protected isInvalid(field: string): boolean {
    return field in this.fieldErrors();
  }

  protected errorFor(field: string): string | undefined {
    return this.fieldErrors()[field];
  }

  protected startAdd(): void {
    this.editingId.set(null);
    this.fieldErrors.set({});
    this.state.set('');
    this.formDirty.set(false);
    this.formMode.set('add');
  }

  protected startEdit(address: Address): void {
    this.editingId.set(address.id);
    this.fieldErrors.set({});
    this.state.set(address.state);
    this.formDirty.set(false);
    this.formMode.set('edit');
  }

  protected markDirty(): void {
    this.formDirty.set(true);
  }

  protected async cancelForm(): Promise<void> {
    if (this.formDirty()) {
      const discard = await this.confirmService.confirm(
        'Discard your unsaved changes to this address?',
        { confirmLabel: 'Discard', danger: true }
      );
      if (!discard) {
        return;
      }
    }
    this.formMode.set(null);
    this.editingId.set(null);
    this.fieldErrors.set({});
    this.formDirty.set(false);
  }

  protected setDefault(id: string): void {
    this.addressService.setDefault(id);
    this.toast.show('Default address updated.', 'success');
  }

  protected async remove(id: string, name: string): Promise<void> {
    const confirmed = await this.confirmService.confirm(`Remove ${name} from your saved addresses?`, {
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.addressService.remove(id);
    this.toast.show('Address removed.', 'info');
  }

  protected submitForm(
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
    if (Object.keys(errors).length > 0) {
      this.fieldErrors.set(errors);
      this.toast.show('Please fix the highlighted fields.', 'error');
      return;
    }

    const wasAdd = this.formMode() === 'add';
    if (wasAdd) {
      this.addressService.add(input);
    } else {
      const id = this.editingId();
      if (id) {
        this.addressService.update(id, input);
      }
    }
    // Not cancelForm() — that prompts to discard unsaved changes, which would be backwards
    // right after a successful save.
    this.formMode.set(null);
    this.editingId.set(null);
    this.fieldErrors.set({});
    this.formDirty.set(false);
    this.toast.show(wasAdd ? 'Address added.' : 'Address updated.', 'success');
  }
}
