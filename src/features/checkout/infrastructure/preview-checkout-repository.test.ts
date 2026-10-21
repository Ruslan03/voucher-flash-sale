import { expect, it } from 'vitest'
import { PreviewCheckoutRepository } from './preview-checkout-repository'
it('provides form/pending fixtures, changes gateways and preserves the deadline across repository reloads', async () => {
  const values = new Map<string, string>(), storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
  const repo = new PreviewCheckoutRepository(storage, () => 1000000)
  const form = await repo.load('zara')
  expect(form?.status).toBe('checkout')
  expect((await repo.load('demo-order'))?.status).toBe('pending')
  expect(await repo.load('unknown')).toBeNull()
  const pending = await repo.start('zara', 'xendit')
  expect(pending).toMatchObject({ status: 'pending', method: 'xendit', virtualAccount: '8808081234567890' })
  expect((await new PreviewCheckoutRepository(storage, () => 1100000).load('zara'))?.expiresAt).toBe(form?.expiresAt)
  expect(await repo.check('zara')).toMatchObject({ status: 'success', method: 'xendit' })
  expect((await repo.check('demo-failed')).status).toBe('failed')
  expect((await repo.check('demo-pending')).status).toBe('pending')
})
it('keeps an isolated memory fallback when storage is unavailable and rejects corrupted stored records', async () => {
  const repo = new PreviewCheckoutRepository({ getItem() { throw new Error('Denied') }, setItem() { throw new Error('Denied') } }, () => 1000000)
  await repo.start('zara', 'midtrans')
  expect((await repo.load('zara'))?.status).toBe('pending')
  const broken = new PreviewCheckoutRepository({ getItem: () => '{broken', setItem() {} })
  await expect(broken.load('zara')).rejects.toMatchObject({ code: 'INVALID_DATA' })
  await expect(repo.start('unknown', 'midtrans')).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

it('continues in memory when storage reads work but writes are denied', async () => {
  const seed = (await new PreviewCheckoutRepository(undefined, () => 1000000).load('zara'))!
  const repo = new PreviewCheckoutRepository({ getItem: () => JSON.stringify(seed), setItem() { throw new Error('Quota exceeded') } }, () => 1000000)
  await repo.start('zara', 'xendit')
  expect((await repo.load('zara'))?.status).toBe('pending')
  expect((await repo.check('zara')).status).toBe('success')
})

it('wires the server fixture read without browser-only dependencies', async () => {
  const { createCheckoutRepository } = await import('@/composition/registry')
  expect(await createCheckoutRepository().load('demo-order')).toMatchObject({ status: 'pending', mode: 'preview' })
})
