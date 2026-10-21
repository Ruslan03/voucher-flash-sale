'use client'
import { useState } from 'react'
import type { PaymentStatusRecord } from '../../domain/payment-status'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { Button } from '@/shared/presentation/components/atoms/button'
import { formatRupiah } from '@/shared/presentation/lib/commerce-format'
import { formatPaymentDate } from '../lib/format-payment-date'
import styles from './payment-receipt.module.css'

export function PaymentReceipt({ payment }: { payment: PaymentStatusRecord }) {
  const success = payment.status === 'success'
  const [message, setMessage] = useState(''), [copying, setCopying] = useState(false)
  async function copyOrderId() {
    setCopying(true); setMessage('')
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(payment.orderId)
      setMessage('Order ID berhasil disalin')
    } catch { setMessage('Salin Order ID secara manual dari rincian di atas.') }
    finally { setCopying(false) }
  }
  return <section className={styles.receipt} data-status={payment.status} aria-label="Rincian Pembayaran">
    <header className={styles.header}><h2><Icon name="receipt_long" />Rincian Pembayaran</h2><span className={styles.badge}><Icon name={success ? 'check' : 'close'} />{success ? 'LUNAS' : 'GAGAL'}</span></header>
    <dl className={styles.details}>
      <div><dt>Order ID</dt><dd className={styles.order}><code>{payment.orderId}</code><Button className={styles.copy} variant="outline" onClick={copyOrderId} disabled={copying} aria-label="Salin Order ID" title="Salin ID"><Icon name="content_copy" /></Button></dd></div>
      <div><dt>Waktu Transaksi</dt><dd><time dateTime={payment.transactedAt}>{formatPaymentDate(payment.transactedAt)}</time></dd></div>
      {!success && <div><dt>Status Transaksi</dt><dd className={styles.failure}>Gagal ({payment.failureReason})</dd></div>}
      <div><dt>Metode Pembayaran</dt><dd>{payment.paymentMethod} · {success ? 'Lunas' : 'Gagal'}</dd></div>
      <div className={styles.total}><dt><strong>{success ? 'Total Dibayar' : 'Jumlah Tagihan'}</strong><small>{success ? `Hemat ${formatRupiah(payment.faceValue - payment.amount)}` : 'Pembayaran Dibatalkan'}</small></dt><dd><b>{formatRupiah(payment.amount)}</b>{success && <del>{formatRupiah(payment.faceValue)}</del>}</dd></div>
    </dl>
    <p className={styles.feedback} role="status">{message}</p>
  </section>
}
