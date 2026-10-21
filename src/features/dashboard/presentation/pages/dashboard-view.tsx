'use client'

import { useState } from 'react'
import { getSessionStatus, type DashboardCategory, type DashboardSnapshot, type SessionStatus } from '../../domain/dashboard'
import type { ActionResult } from '@/shared/domain/result'
import { getDashboardController } from '../../controllers/dashboard-controller'
import { useDashboardClock } from '../hooks/use-dashboard-clock'
import { DashboardHeader } from '../components/dashboard-header'
import { SessionHero } from '../components/session-hero'
import { OwnedVouchers } from '../components/owned-vouchers'
import { VoucherCatalog } from '../components/voucher-catalog'
import { CouponDialog, type CouponSelection } from '../components/coupon-dialog'
import { DashboardFooter } from '../components/dashboard-footer'
import { useRouter } from 'next/navigation'
import styles from './dashboard-view.module.css'

export function DashboardView({ initialResult }: { initialResult: ActionResult<DashboardSnapshot> }) {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState(initialResult.success ? initialResult.data : null)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<DashboardCategory | 'all'>('all')
  const [selection, setSelection] = useState<CouponSelection>()
  const [notice, setNotice] = useState(
    'Flash Sale PromoRush sedang berlangsung. Kuota terbatas maks. 1 kupon per kategori!'
  )
  const [error, setError] = useState(initialResult.success ? '' : 'Dashboard belum dapat dimuat. Silakan coba lagi.')
  const deviceNow = useDashboardClock(snapshot ? Date.parse(snapshot.fetchedAt) : 0)

  async function reload() {
    setLoading(true); setError('')
    try {
      const result = await getDashboardController()
      if (result.success) { setSnapshot(result.data); setCategory('all') }
      else setError(typeof result.error === 'string' ? result.error : result.error.message)
    } catch { setError('Dashboard belum dapat dimuat. Silakan coba lagi.') }
    finally { setLoading(false) }
  }

  if (!snapshot || loading) return <main className={styles.fallback}><h1>PromoRush Dashboard</h1>{loading ? <p role="status">Memuat dashboard...</p> : <><p role="alert">{error}</p><button type="button" onClick={reload}>Coba lagi</button></>}</main>

  const now = Math.max(deviceNow, Date.parse(snapshot.fetchedAt))
  const status = getSessionStatus(snapshot.session, now)

  function confirmPurchase(id: string) {
    setSelection(undefined)
    router.push(`/vouchers/${id}`)
  }

  return <div className={styles.page}>
    <a className={styles.skip} href="#dashboard-main">Lewati ke konten</a>
    <DashboardHeader now={now} user={snapshot.user} />
    <main className={styles.main} id="dashboard-main">
      <SessionHero session={snapshot.session} now={now} status={status} />
      <p role="status" className={styles.notice}>{notice}</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <OwnedVouchers owned={snapshot.owned} onChoose={setCategory} onDetails={coupon => setSelection({ kind: 'owned', coupon })} />
      <VoucherCatalog snapshot={snapshot} category={category} now={now} onCategoryChange={setCategory} onPurchase={id => {
        const offer = snapshot.offers.find(item => item.id === id)
        if (offer) setSelection({ kind: 'purchase', offer })
      }} />
    </main>
    <DashboardFooter status={status} />
    {selection && <CouponDialog selection={selection} mode={snapshot.mode} onClose={() => setSelection(undefined)} onConfirm={confirmPurchase} />}
  </div>
}
