export interface AddressFieldValues {
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
}

export function validateAddressFields(values: AddressFieldValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.fullName.trim()) {
    errors['fullName'] = 'Full name is required.';
  }
  if (!/^\d{10}$/.test(values.phone.trim())) {
    errors['phone'] = 'Enter a valid 10-digit phone number.';
  }
  if (!values.addressLine1.trim()) {
    errors['addressLine1'] = 'Delivery address is required.';
  }
  if (!values.city.trim()) {
    errors['city'] = 'City is required.';
  }
  if (!values.state.trim()) {
    errors['state'] = 'Please select a state.';
  }
  if (!/^\d{6}$/.test(values.pincode.trim())) {
    errors['pincode'] = 'Enter a valid 6-digit pincode.';
  }

  return errors;
}
