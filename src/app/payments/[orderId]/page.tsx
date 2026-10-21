import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PaymentStatusPage } from '@/features/payment-status/presentation/pages/payment-status-page'
export const metadata: Metadata = { title: 'PromoRush — Status Pembayaran', description: 'Rincian status pembayaran voucher PromoRush. Preview lokal.' }
export default function Page({ params }: { params: Promise<{ orderId: string }> }) {
  return <Suspense fallback={<p role="status">Memuat status pembayaran...</p>}><PaymentStatusPage params={params} /></Suspense>
}
