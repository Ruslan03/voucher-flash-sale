'use client'
import { useEffect, useState } from 'react'
import type { SaleVoucher } from '../../domain/sale-voucher'
import type { ActionResult } from '@/shared/domain/result'
import { getVoucherDetailsController } from '../../controllers/voucher-details-controller'
import { voucherPurchasePreviewController } from '../../controllers/voucher-purchase-preview-controller'
import { Breadcrumbs } from '@/shared/presentation/components/molecules/breadcrumbs'
import { Button } from '@/shared/presentation/components/atoms/button'
import { VoucherHeading } from '../components/voucher-heading'
import { VoucherSpecifications } from '../components/voucher-specifications'
import { VoucherTerms } from '../components/voucher-terms'
import { PurchaseCard } from '../components/purchase-card'
import { PurchaseConfirmation } from '../components/purchase-confirmation'
import { VoucherShareModal } from '../components/voucher-share-modal'
import styles from './voucher-details-view.module.css'

export function VoucherDetailsView({ initialResult, id = 'zara' }: { initialResult: ActionResult<SaleVoucher>; id?: string }) {
  const [result, setResult] = useState(initialResult), [purchased, setPurchased] = useState(false)
  const [now, setNow] = useState(initialResult.success ? Date.parse(initialResult.data.fetchedAt) : 0)
  const [modal, setModal] = useState<'purchase' | 'share' | null>(null), [shareUrl, setShareUrl] = useState('')
  const [feedback, setFeedback] = useState(''), [loading, setLoading] = useState(false)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  async function reload() {
    setLoading(true)
    try { const next = await getVoucherDetailsController(id); setResult(next); if (next.success) setNow(Date.now()) }
    catch { setResult({ success: false, error: 'Detail voucher belum dapat dimuat.' }) }
    finally { setLoading(false) }
  }
  function confirm() {
    if (!result.success) return
    if (result.data.mode === 'live') {
      setPurchased(true)
      setFeedback(`Pesanan untuk ${result.data.name} berhasil dibuat. Silakan selesaikan pembayaran.`)
      setModal(null)
      return
    }
    const response = voucherPurchasePreviewController(result.data, Date.now(), purchased)
    if (response.success) { setResult({ success: true, data: response.data.voucher }); setPurchased(true); setFeedback(`Pembelian demo berhasil: ${response.data.confirmationId}`) }
    else setFeedback(typeof response.error === 'string' ? response.error : response.error.message)
    setModal(null)
  }
  return <main className={styles.page}><div className={styles.container}>
    <Breadcrumbs items={[{ label: 'PromoRush', href: '/dashboard' }, { label: 'Voucher Details' }]} />
    {!result.success ? <section className={styles.error}><h1>Detail voucher belum tersedia</h1><p role="alert">{typeof result.error === 'string' ? result.error : result.error.message}</p><Button onClick={reload} disabled={loading}>{loading ? 'Memuat...' : 'Coba lagi'}</Button></section> : <>
      {feedback && <p role="status" className={styles.feedback}>{feedback}</p>}
      <div className={styles.layout}><div><VoucherHeading voucher={result.data} /><VoucherSpecifications voucher={result.data} /><VoucherTerms terms={result.data.terms} /></div>
      <PurchaseCard voucher={result.data} now={now} purchased={purchased} onBuy={() => setModal('purchase')} onShare={() => { setShareUrl(window.location.href); setModal('share') }} /></div>
      <PurchaseConfirmation voucher={result.data} open={modal === 'purchase'} onClose={() => setModal(null)} onConfirm={confirm} />
      <VoucherShareModal open={modal === 'share'} url={shareUrl} title={result.data.name} onClose={() => setModal(null)} />
    </>}
  </div></main>
}
