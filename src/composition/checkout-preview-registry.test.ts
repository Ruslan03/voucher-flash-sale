// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
it('uses a stable browser-only preview binding and persists through a fresh module instance', async () => {
  localStorage.clear(); vi.resetModules()
  const { createCheckoutPreviewRepository } = await import('./checkout-preview-registry')
  const repo = createCheckoutPreviewRepository()
  expect(createCheckoutPreviewRepository()).toBe(repo)
  await repo.start('zara', 'midtrans')
  vi.resetModules()
  const fresh = await import('./checkout-preview-registry')
  expect((await fresh.createCheckoutPreviewRepository().load('zara'))?.status).toBe('pending')
  localStorage.clear()
})
