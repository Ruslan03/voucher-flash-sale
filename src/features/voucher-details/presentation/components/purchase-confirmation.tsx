import type { SaleVoucher } from '../../domain/sale-voucher'
import { Modal } from '@/shared/presentation/components/molecules/modal'
import { Button } from '@/shared/presentation/components/atoms/button'
import { formatRupiah } from '@/shared/presentation/lib/commerce-format'
import styles from './purchase-confirmation.module.css'
export function PurchaseConfirmation({ voucher, open, onClose, onConfirm }: { voucher: SaleVoucher; open: boolean; onClose: () => void; onConfirm: () => void }) {
  const isLive = voucher.mode === 'live'
  return <Modal open={open} title={isLive ? 'Konfirmasi Pembelian Voucher' : 'Konfirmasi pembelian demo'} onClose={onClose}><div className={styles.summary}><strong>{voucher.name}</strong><b>{formatRupiah(voucher.price)}</b><p>{isLive ? 'Voucher ini siap diklaim pada flash sale. Kuota dibatasi maks 1 voucher per kategori per pengguna.' : 'Simulasi lokal. Tidak ada pembayaran atau klaim ke server. Status dan kuota akan diperiksa kembali saat konfirmasi.'}</p></div><Button className={styles.confirm} onClick={onConfirm}>{isLive ? 'Konfirmasi Pembelian' : 'Konfirmasi demo'}</Button></Modal>
}
