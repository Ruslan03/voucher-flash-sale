import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CheckoutPage } from '@/features/checkout/presentation/pages/checkout-page'
export const metadata: Metadata = { title: 'PromoRush — Checkout & Pembayaran', description: 'Preview checkout dan instruksi pembayaran voucher PromoRush.' }
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p role="status">Memuat checkout...</p>}><CheckoutPage params={params} /></Suspense>
}
