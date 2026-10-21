import { expect, it } from 'vitest'
import { assertCheckout, checkoutState, checkoutTotal, CheckoutError, type CheckoutOrder } from './checkout'
const order: CheckoutOrder = { mode: 'preview', id: 'zara', orderId: '#ORD', reservationId: '#RES', voucher: { id: 'zara', name: 'Zara', category: 'Fashion', faceValue: 200000, price: 50000 }, discount: 0, fee: 0, method: null, status: 'checkout', createdAt: new Date(0).toISOString(), fetchedAt: new Date(0).toISOString(), expiresAt: new Date(300000).toISOString(), virtualAccount: null }
it('validates all states and rejects incomplete, contradictory and unsupported data', () => {
  expect(() => assertCheckout(order)).not.toThrow()
  expect(() => assertCheckout({ ...order, status: 'pending', method: 'midtrans', virtualAccount: '12345678' })).not.toThrow()
  for (const invalid of [null, {}, { ...order, mode: 'live' }, { ...order, fee: -1 }, { ...order, discount: 50001 }, { ...order, method: 'bank' }, { ...order, status: 'pending' }, { ...order, expiresAt: 'invalid' }, { ...order, expiresAt: order.createdAt }, { ...order, voucher: { ...order.voucher, price: NaN } }]) expect(() => assertCheckout(invalid)).toThrow(CheckoutError)
})
it('calculates the total and handles exact expiry boundaries without invalidating a settled result', () => {
  expect(checkoutTotal(order)).toBe(50000)
  expect(checkoutTotal({ ...order, discount: 5000, fee: 2000 })).toBe(47000)
  expect(checkoutState(order, 299999)).toBe('checkout')
  expect(checkoutState(order, 300000)).toBe('expired')
  expect(checkoutState({ ...order, status: 'success' }, 300001)).toBe('success')
})
