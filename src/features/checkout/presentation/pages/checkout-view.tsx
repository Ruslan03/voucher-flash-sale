'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { checkoutState, type CheckoutOrder, type PaymentMethod } from '../../domain/checkout'
import type { ActionResult } from '@/shared/domain/result'
import { restoreCheckoutPreview, startCheckoutPreview } from '../../controllers/checkout-preview-controller'
import { Breadcrumbs } from '@/shared/presentation/components/molecules/breadcrumbs'
import { Button } from '@/shared/presentation/components/atoms/button'
import { CheckoutHeading } from '../components/checkout-heading'
import { PaymentMethodPicker } from '../components/payment-method-picker'
import { CheckoutSummary } from '../components/checkout-summary'
import { ReservationCountdown } from '../components/reservation-countdown'
import styles from './checkout-view.module.css'
const unavailable: ActionResult<CheckoutOrder> = { success: false, error: 'Simulasi checkout belum dapat diproses. Silakan coba lagi.' }

export function CheckoutView({ id, initialResult }: { id: string; initialResult: ActionResult<CheckoutOrder> }) {
  const router = useRouter()
  const [result, setResult] = useState(initialResult), [method, setMethod] = useState<PaymentMethod>('midtrans')
  const [now, setNow] = useState(initialResult.success ? Date.parse(initialResult.data.fetchedAt) : 0)
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  const flight = useRef(false), active = useRef(true)
  useEffect(() => {
    active.current = true
    restoreCheckoutPreview(id).catch(() => unavailable).then(next => {
      if (!active.current) return
      setResult(next); setNow(Date.now()); setReady(true)
      if (next.success) { if (next.data.method) setMethod(next.data.method) }
    })
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => { active.current = false; clearInterval(timer) }
  }, [id, router])
  async function restore() {
    if (flight.current) return
    flight.current = true; setBusy(true)
    try {
      const next = await restoreCheckoutPreview(id)
      if (active.current) { setResult(next); setNow(Date.now()); setReady(true) }
    } catch { if (active.current) setResult(unavailable) }
    finally { flight.current = false; if (active.current) setBusy(false) }
  }
  async function pay() {
    if (!ready || flight.current) return
    flight.current = true; setBusy(true); setMessage('')
    try {
      const next = await startCheckoutPreview(id, method)
      if (next.success) router.push(`/payment-status/${id}`)
      else setMessage(typeof next.error === 'string' ? next.error : next.error.message)
    } catch { setMessage('Simulasi checkout belum dapat diproses. Silakan coba lagi.') }
    finally { flight.current = false; if (active.current) setBusy(false) }
  }
  const state = result.success ? checkoutState(result.data, now) : 'unavailable'
  useEffect(() => { if (ready && state !== 'checkout' && state !== 'failed' && state !== 'unavailable') router.replace(`/payment-status/${id}`) }, [id, ready, state, router])
  return <main className={styles.page}><div className={styles.container}>
    {message && <p className={styles.feedback} role="status">{message}</p>}
    {!result.success ? <section className={styles.error}><h1>Checkout belum tersedia</h1><p role="alert">{typeof result.error === 'string' ? result.error : result.error.message}</p><Button onClick={restore} disabled={busy}>{busy ? 'Memuat...' : 'Coba lagi'}</Button></section> : state === 'checkout' || state === 'failed' ? <>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Checkout' }]} /><CheckoutHeading order={result.data} />
      <div className={styles.layout}><div className={styles.left}><ReservationCountdown expiresAt={result.data.expiresAt} now={now} /><PaymentMethodPicker value={method} disabled={!ready || busy} onChange={setMethod} /></div><CheckoutSummary order={result.data} busy={busy} disabled={!ready} onPay={() => { void pay() }} /></div>
    </> : <p role="status">Redirigasi ke status pembayaran...</p>}

    <footer className={styles.preview}><p>Preview lokal • Tidak ada pembayaran atau reservasi kuota backend nyata.</p>{!ready && <p role="status">Memulihkan preview...</p>}<Link href="/dashboard">Kembali ke Dashboard</Link></footer>
  </div></main>
}
