import { expect, it } from 'vitest'
import { DemoPaymentStatusRepository } from './demo-payment-status-repository'
it('provides isolated success and failure previews and no fabricated fallback order', async () => {
  const repo = new DemoPaymentStatusRepository()
  const success = await repo.findById('demo-success'), failed = await repo.findById('demo-failed')
  expect(success).toMatchObject({ mode: 'preview', status: 'success', amount: 50000, faceValue: 200000 })
  expect(failed).toMatchObject({ mode: 'preview', status: 'failed', failureReason: 'Gateway Timeout' })
  success!.amount = 0
  expect((await repo.findById('demo-success'))?.amount).toBe(50000)
  expect(await repo.findById('unknown')).toBeNull()
})

it('wires the read-only preview adapter through the composition root', async () => {
  const { createPaymentStatusRepository } = await import('@/composition/registry')
  expect(await createPaymentStatusRepository().findById('demo-failed')).toMatchObject({ status: 'failed', mode: 'preview' })
})
