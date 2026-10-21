'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkoutState, restoreCheckoutPreview, checkCheckoutPreview, PendingCheckout, CheckoutOutcome, type CheckoutOrder } from '@/features/checkout/public'
import type { ActionResult } from '@/shared/domain/result'
import { Button } from '@/shared/presentation/components/atoms/button'
import styles from './order-payment-status-view.module.css'
export function OrderPaymentStatusView({ id, initialResult }: { id: string; initialResult: ActionResult<CheckoutOrder> }) {
 const router = useRouter(), [result, setResult] = useState(initialResult), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('')
 const [now, setNow] = useState(initialResult.success ? Date.parse(initialResult.data.fetchedAt) : 0), flight = useRef(false)
 useEffect(() => {
  let active = true
  restoreCheckoutPreview(id).then(next => { if (active) { setResult(next); setNow(Date.now()); setReady(true); if (next.success && next.data.status === 'checkout') router.replace(`/payment-method/${id}`) } }).catch(() => { if (active) { setMessage('Status pembayaran belum dapat dimuat.'); setReady(true) } })
  const timer = setInterval(() => setNow(Date.now()), 1000)
  return () => { active = false; clearInterval(timer) }
 }, [id, router])
 const check = useCallback(async () => {
  if (flight.current || !ready) return
  flight.current = true; setBusy(true); setMessage('')
  try { const next = await checkCheckoutPreview(id); setNow(Date.now()); if (next.success) setResult(next); else setMessage(typeof next.error === 'string' ? next.error : next.error.message) }
  catch { setMessage('Status pembayaran belum dapat dimuat. Silakan coba lagi.') }
  finally { flight.current = false; setBusy(false) }
 }, [id, ready])
 const state = result.success ? checkoutState(result.data, now) : 'unavailable'
 useEffect(() => { if (!ready || state !== 'pending') return; const timer = setInterval(() => { void check() }, 20000); return () => clearInterval(timer) }, [ready, state, check])
 return <main className={styles.page}>{message && <p role="status" className={styles.message}>{message}</p>}{!result.success ? <section className={styles.error}><h1>Status pembayaran belum tersedia</h1><Button disabled={busy} onClick={() => { void check() }}>Coba lagi</Button></section> : state === 'pending' ? <PendingCheckout order={result.data} now={now} busy={!ready || busy} onCheck={() => { void check() }} /> : state === 'checkout' ? <p role="status">Membuka pilihan metode pembayaran...</p> : <CheckoutOutcome order={result.data} state={state as 'success' | 'failed' | 'expired'} onRetry={() => router.push(`/payment-method/${id}`)} />}<p className={styles.preview}>Preview lokal • Tanpa pembayaran atau reservasi backend nyata.</p></main>
}
