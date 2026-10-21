import { Suspense } from 'react'
import { VoucherPage } from '@/features/voucher/presentation/pages/voucher-page'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-500">Loading feature container...</div>}>
      <VoucherPage />
    </Suspense>
  )
}
