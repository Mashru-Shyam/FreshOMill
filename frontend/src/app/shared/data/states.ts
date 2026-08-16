/** Shared by every address-shaped form (Checkout's shipping details, Profile's Basic
 *  Information, Profile's Saved Addresses add/edit) — was duplicated as a literal option
 *  list/array in three places before; now a single source of truth for `<app-state-select>`. */
export const INDIAN_STATES: readonly string[] = [
  'Andhra Pradesh',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Other',
];
