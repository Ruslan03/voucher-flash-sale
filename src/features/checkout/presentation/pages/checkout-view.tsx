'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { checkoutState, type CheckoutOrder, type PaymentMethod } from '../../domain/checkout'
import type { ActionResult } from '@/shared/domain/result'
import { restoreCheckoutPreview, startCheckoutPreview, checkCheckoutPreview } from '../../controllers/checkout-preview-controller'
import { Breadcrumbs } from '@/shared/presentation/components/molecules/breadcrumbs'
import { Button } from '@/shared/presentation/components/atoms/button'
import { CheckoutHeading } from '../components/checkout-heading'
import { PaymentMethodPicker } from '../components/payment-method-picker'
import { CheckoutSummary } from '../components/checkout-summary'
import { ReservationCountdown } from '../components/reservation-countdown'
import { PendingCheckout } from '../components/pending-checkout'
import { CheckoutOutcome } from '../components/checkout-outcome'
import styles from './checkout-view.module.css'
const unavailable: ActionResult<CheckoutOrder> = { success: false, error: 'Simulasi checkout belum dapat diproses. Silakan coba lagi.' }

export function CheckoutView({ id, initialResult }: { id: string; initialResult: ActionResult<CheckoutOrder> }) {
  const [result, setResult] = useState(initialResult), [method, setMethod] = useState<PaymentMethod>('midtrans')
  const [now, setNow] = useState(initialResult.success ? Date.parse(initialResult.data.fetchedAt) : 0)
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [editing, setEditing] = useState(false), [message, setMessage] = useState('')
  const flight = useRef(false), active = useRef(true)
  useEffect(() => {
    active.current = true
    restoreCheckoutPreview(id).catch(() => unavailable).then(next => {
      if (!active.current) return
      setResult(next); setNow(Date.now()); setReady(true)
      if (next.success && next.data.method) setMethod(next.data.method)
    })
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => { active.current = false; clearInterval(timer) }
  }, [id])
  async function restore() {
    if (flight.current) return
    flight.current = true; setBusy(true)
    try {
      const next = await restoreCheckoutPreview(id)
      if (active.current) { setResult(next); setNow(Date.now()); setReady(true) }
    } catch { if (active.current) setResult(unavailable) }
    finally { flight.current = false; if (active.current) setBusy(false) }
  }
  const perform = useCallback(async (operation: 'start' | 'check') => {
    if (!ready || flight.current) return
    flight.current = true; setBusy(true); setMessage('')
    try {
      const next = operation === 'start' ? await startCheckoutPreview(id, method) : await checkCheckoutPreview(id)
      if (!active.current) return
      setNow(Date.now())
      if (next.success) { setResult(next); setEditing(false); if (operation === 'check' && next.data.status === 'pending') setMessage('Pembayaran demo masih menunggu.') }
      else setMessage(typeof next.error === 'string' ? next.error : next.error.message)
    } catch { if (active.current) setMessage('Simulasi checkout belum dapat diproses. Silakan coba lagi.') }
    finally { flight.current = false; if (active.current) setBusy(false) }
  }, [id, method, ready])
  const state = result.success ? checkoutState(result.data, now) : 'unavailable'
  useEffect(() => {
    if (!ready || state !== 'pending') return
    const timer = setInterval(() => { void perform('check') }, 20000)
    return () => clearInterval(timer)
  }, [ready, state, perform])
  return <main className={styles.page}><div className={styles.container}>
    {message && <p className={styles.feedback} role="status">{message}</p>}
    {!result.success ? <section className={styles.error}><h1>Checkout belum tersedia</h1><p role="alert">{typeof result.error === 'string' ? result.error : result.error.message}</p><Button onClick={restore} disabled={busy}>{busy ? 'Memuat...' : 'Coba lagi'}</Button></section> : state === 'checkout' || (editing && state === 'failed') ? <>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Checkout' }]} /><CheckoutHeading order={result.data} />
      <div className={styles.layout}><div className={styles.left}><ReservationCountdown expiresAt={result.data.expiresAt} now={now} /><PaymentMethodPicker value={method} disabled={!ready || busy} onChange={setMethod} /></div><CheckoutSummary order={result.data} busy={busy} disabled={!ready} onPay={() => { void perform('start') }} /></div>
    </> : state === 'pending' ? <PendingCheckout order={result.data} now={now} busy={busy || !ready} onCheck={() => { void perform('check') }} /> : <CheckoutOutcome order={result.data} state={state as 'success' | 'failed' | 'expired'} onRetry={() => { setMessage(''); setEditing(true) }} />}
    <footer className={styles.preview}><p>Preview lokal • Tidak ada pembayaran atau reservasi kuota backend nyata.</p>{!ready && <p role="status">Memulihkan preview...</p>}<Link href="/dashboard">Kembali ke Dashboard</Link></footer>
  </div></main>
}
