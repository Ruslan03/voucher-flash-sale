import { Suspense } from 'react'
import type { Metadata } from 'next'
import { VoucherDetailsPage } from '@/features/voucher-details/presentation/pages/voucher-details-page'
export const metadata: Metadata = { title: 'PromoRush — Voucher Details', description: 'Detail penawaran voucher flash sale. Preview lokal.' }
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p role="status">Memuat detail voucher...</p>}><VoucherDetailsPage params={params} /></Suspense>
}
