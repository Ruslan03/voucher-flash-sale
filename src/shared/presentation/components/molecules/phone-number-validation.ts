/** Input-format validation only; feature-specific mobile rules live in the feature. */
export function getPhoneNumberInputError(value: string, required = false): string | undefined {
  if (!value) return required ? 'Mobile phone number is required.' : undefined
  if (!/^[0-9]+$/.test(value)) return 'Use numbers only (0–9) for your mobile number.'
  return undefined
}
