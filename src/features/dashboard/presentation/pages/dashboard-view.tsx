'use client'

import { useState } from 'react'
import { getSessionStatus, type DashboardCategory, type DashboardSnapshot, type SessionStatus } from '../../domain/dashboard'
import type { ActionResult } from '@/shared/domain/result'
import { getDashboardController } from '../../controllers/dashboard-controller'
import { previewPurchaseController } from '../../controllers/dashboard-preview-controller'
import { useDashboardClock } from '../hooks/use-dashboard-clock'
import { DashboardHeader } from '../components/dashboard-header'
import { SessionHero } from '../components/session-hero'
import { OwnedVouchers } from '../components/owned-vouchers'
import { VoucherCatalog } from '../components/voucher-catalog'
import { CouponDialog, type CouponSelection } from '../components/coupon-dialog'
import { DashboardFooter } from '../components/dashboard-footer'
import styles from './dashboard-view.module.css'

export function DashboardView({ initialResult }: { initialResult: ActionResult<DashboardSnapshot> }) {
  const [snapshot, setSnapshot] = useState(initialResult.success ? initialResult.data : null)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<DashboardCategory | 'all'>('all')
  const [scenario, setScenario] = useState<SessionStatus>('upcoming')
  const [selection, setSelection] = useState<CouponSelection>()
  const [notice, setNotice] = useState('Mode preview: data dan pembelian hanya simulasi lokal. Refresh akan mengulang demo.')
  const [error, setError] = useState(initialResult.success ? '' : 'Dashboard belum dapat dimuat. Silakan coba lagi.')
  const deviceNow = useDashboardClock(snapshot ? Date.parse(snapshot.fetchedAt) : 0)

  async function reload() {
    setLoading(true); setError('')
    try {
      const result = await getDashboardController()
      if (result.success) { setSnapshot(result.data); setScenario('upcoming'); setCategory('all') }
      else setError(typeof result.error === 'string' ? result.error : result.error.message)
    } catch { setError('Dashboard belum dapat dimuat. Silakan coba lagi.') }
    finally { setLoading(false) }
  }

  if (!snapshot || loading) return <main className={styles.fallback}><h1>PromoRush Dashboard</h1>{loading ? <p role="status">Memuat dashboard...</p> : <><p role="alert">{error}</p><button type="button" onClick={reload}>Coba lagi</button></>}</main>

  const baseNow = Math.max(deviceNow, Date.parse(snapshot.fetchedAt))
  const shift = scenario === 'upcoming' ? 0 : Date.parse(scenario === 'live' ? snapshot.session.startsAt : snapshot.session.endsAt) - Date.parse(snapshot.fetchedAt) + (scenario === 'live' ? 60000 : 1000)
  const now = baseNow + shift
  const status = getSessionStatus(snapshot.session, now)

  function confirmPurchase(id: string) {
    const result = previewPurchaseController(snapshot!, id, now)
    if (result.success) {
      setSnapshot(result.data.snapshot); setSelection(undefined); setError('')
      setNotice(`Pembelian demo ${result.data.coupon.merchant} berhasil. Kupon ditambahkan ke slot Anda.`)
    } else {
      setSelection(undefined); setError(typeof result.error === 'string' ? result.error : result.error.message)
    }
  }

  return <div className={styles.page}>
    <a className={styles.skip} href="#dashboard-main">Lewati ke konten</a>
    <DashboardHeader now={baseNow} user={snapshot.user} />
    <main className={styles.main} id="dashboard-main">
      <SessionHero session={snapshot.session} now={now} status={status} scenario={scenario} onScenarioChange={setScenario} />
      <p role="status" className={styles.notice}>{notice}</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <OwnedVouchers owned={snapshot.owned} onChoose={setCategory} onDetails={coupon => setSelection({ kind: 'owned', coupon })} />
      <VoucherCatalog snapshot={snapshot} category={category} now={now} onCategoryChange={setCategory} onPurchase={id => {
        const offer = snapshot.offers.find(item => item.id === id)
        if (offer) setSelection({ kind: 'purchase', offer })
      }} />
    </main>
    <DashboardFooter status={status} />
    {selection && <CouponDialog selection={selection} onClose={() => setSelection(undefined)} onConfirm={confirmPurchase} />}
  </div>
}
