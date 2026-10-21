import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DashboardPage } from '@/features/dashboard/presentation/pages/dashboard-page'

export const metadata: Metadata = { title: 'PromoRush — Flash Sale Dashboard', description: 'Katalog flash sale dan kupon milik Anda. Preview lokal PromoRush.' }

export default function Page() {
  return <Suspense fallback={<p role="status">Memuat dashboard...</p>}><DashboardPage /></Suspense>
}
