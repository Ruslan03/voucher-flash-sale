import { expect, it, vi } from 'vitest'
import { PreviewCheckoutRepository } from '../infrastructure/preview-checkout-repository'
import { loadCheckout, startCheckout, checkCheckout } from './checkout-actions'
it('loads exact IDs and validates absent, invalid and mismatched data', async () => {
  const repo = new PreviewCheckoutRepository(undefined, () => 1000000)
  expect((await loadCheckout(repo, 'zara')).status).toBe('checkout')
  await expect(loadCheckout(repo, '../bad')).rejects.toMatchObject({ code: 'INVALID_ID' })
  await expect(loadCheckout(repo, 'missing')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  vi.spyOn(repo, 'load').mockResolvedValue({ ...(await repo.load('zara'))!, id: 'other' })
  await expect(loadCheckout(repo, 'zara')).rejects.toMatchObject({ code: 'INVALID_DATA' })
})
it('starts eligible payment, rejects invalid method, duplicates and expired reservations', async () => {
  const repo = new PreviewCheckoutRepository(undefined, () => 1000000)
  await expect(startCheckout(repo, 'zara', 'bank' as 'midtrans', 1000000)).rejects.toMatchObject({ code: 'INVALID_METHOD' })
  expect(await startCheckout(repo, 'zara', 'midtrans', 1000000)).toMatchObject({ status: 'pending', method: 'midtrans' })
  await expect(startCheckout(repo, 'zara', 'midtrans', 1000000)).rejects.toMatchObject({ code: 'NOT_AVAILABLE' })
  await expect(startCheckout(repo, 'demo-order', 'midtrans', 2000000)).rejects.toMatchObject({ code: 'EXPIRED' })
})
it('checks pending status, preserves terminal outcomes and blocks checks after expiry', async () => {
  const repo = new PreviewCheckoutRepository(undefined, () => 1000000)
  expect((await checkCheckout(repo, 'demo-order', 1000000)).status).toBe('success')
  expect((await checkCheckout(repo, 'demo-order', 2000000)).status).toBe('success')
  expect((await checkCheckout(repo, 'demo-failed', 1000000)).status).toBe('failed')
  await expect(checkCheckout(repo, 'demo-pending', 2000000)).rejects.toMatchObject({ code: 'EXPIRED' })
  await expect(checkCheckout(repo, 'zara', 1000000)).rejects.toMatchObject({ code: 'NOT_AVAILABLE' })
})
