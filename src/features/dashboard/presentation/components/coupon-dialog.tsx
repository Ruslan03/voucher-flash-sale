'use client'

import { useEffect, useRef } from 'react'
import type { DashboardOffer, OwnedCoupon } from '../../domain/dashboard'
import { Button } from '@/shared/presentation/components/atoms/button'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { formatDashboardDate, formatRupiah } from '../lib/format'
import styles from './coupon-dialog.module.css'

export type CouponSelection = { kind: 'purchase'; offer: DashboardOffer } | { kind: 'owned'; coupon: OwnedCoupon }

export function CouponDialog({ selection, onClose, onConfirm }: { selection: CouponSelection; onClose: () => void; onConfirm: (id: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])
  const purchase = selection.kind === 'purchase'
  const merchant = selection.kind === 'purchase' ? selection.offer.merchant : selection.coupon.merchant
  return <dialog ref={ref} className={styles.dialog} aria-labelledby="coupon-dialog-title" onCancel={event => { event.preventDefault(); onClose() }}>
    <button className={styles.close} type="button" onClick={onClose} aria-label="Tutup"><Icon name="close" /></button>
    <span className={styles.preview}>PREVIEW LOKAL</span>
    <h2 id="coupon-dialog-title">{purchase ? 'Konfirmasi pembelian demo' : 'Detail Kupon Demo'}</h2>
    <h3>{merchant}</h3>
    {selection.kind === 'purchase' ? <>
      <dl className={styles.summary}><div><dt>Nilai awal</dt><dd>{formatRupiah(selection.offer.originalPrice)}</dd></div><div><dt>Hemat</dt><dd>{formatRupiah(selection.offer.originalPrice - selection.offer.price)}</dd></div><div><dt>Bayar (simulasi)</dt><dd>{formatRupiah(selection.offer.price)}</dd></div></dl>
      <p className={styles.notice}>Tidak ada pembayaran atau permintaan backend. Konfirmasi hanya memperbarui kuota dan kupon pada preview browser ini.</p>
      <Button className={styles.confirm} onClick={() => onConfirm(selection.offer.id)}>Konfirmasi demo</Button>
    </> : <>
      <p className={styles.code}>{selection.coupon.code}</p>
      <dl className={styles.summary}><div><dt>Diskon</dt><dd>{formatRupiah(selection.coupon.savings)}</dd></div><div><dt>Bayar (simulasi)</dt><dd>{formatRupiah(selection.coupon.paid)}</dd></div><div><dt>Berlaku sampai</dt><dd>{formatDashboardDate(selection.coupon.expiresAt)}</dd></div></dl>
      <p className={styles.notice}>Kupon demo tidak dapat ditukarkan di merchant.</p>
    </>}
  </dialog>
}
