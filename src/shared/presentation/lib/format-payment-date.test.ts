import { expect, it } from 'vitest'
import { formatPaymentDate } from './format-payment-date'
it('uses explicit WIB for transactions and calendar-only expiry labels', () => {
  expect(formatPaymentDate('2026-10-25T18:05:00Z')).toBe('26 Okt 2026, 01:05 WIB')
  expect(formatPaymentDate('2026-11-01T16:59:59Z', false)).toBe('1 Nov 2026')
})
