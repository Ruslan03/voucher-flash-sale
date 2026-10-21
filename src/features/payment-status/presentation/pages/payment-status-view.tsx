'use client'
import { useState } from 'react'
import type { ActionResult } from '@/shared/domain/result'
import type { PaymentStatusRecord } from '../../domain/payment-status'
import { getPaymentStatusController } from '../../controllers/payment-status-controller'
import { Button } from '@/shared/presentation/components/atoms/button'
import { PaymentStatusHeading } from '../components/payment-status-heading'
import { PaymentReceipt } from '../components/payment-receipt'
import { VoucherRedemptionNotice } from '../components/voucher-redemption-notice'
import { PaymentStatusActions } from '../components/payment-status-actions'
import styles from './payment-status-view.module.css'

export function PaymentStatusView({ initialResult, id }: { initialResult: ActionResult<PaymentStatusRecord>; id: string }) {
  const [result, setResult] = useState(initialResult), [loading, setLoading] = useState(false)
  async function reload() {
    if (loading) return
    setLoading(true)
    try { setResult(await getPaymentStatusController(id)) }
    catch { setResult({ success: false, error: 'Status pembayaran belum dapat dimuat. Silakan coba lagi.' }) }
    finally { setLoading(false) }
  }
  return <main className={styles.page}><section className={styles.card} data-status={result.success ? result.data.status : 'unavailable'}>
    {result.success ? <>
      <PaymentStatusHeading status={result.data.status} />
      <PaymentReceipt key={result.data.id} payment={result.data} />
      <VoucherRedemptionNotice payment={result.data} />
      <PaymentStatusActions />
      {result.data.mode === 'preview' && <p className={styles.preview}>Preview lokal • Data contoh, tanpa pembayaran atau verifikasi gateway nyata.</p>}
    </> : <>
      <h1 className={styles.errorTitle}>Status pembayaran belum tersedia</h1><p className={styles.error} role="alert">{typeof result.error === 'string' ? result.error : result.error.message}</p>
      <Button onClick={reload} disabled={loading}>{loading ? 'Memuat...' : 'Coba lagi'}</Button><PaymentStatusActions />
    </>}
  </section></main>
}
