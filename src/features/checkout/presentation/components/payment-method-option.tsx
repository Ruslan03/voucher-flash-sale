import type { PaymentMethod } from '../../domain/checkout'
import styles from './payment-method-option.module.css'
const gateways = {
  midtrans: { name: 'Midtrans Payment Gateway', badge: 'Direkomendasikan', description: 'Instant verification, no manual confirmation required', channels: ['GoPay', 'QRIS', 'BCA VA', 'ShopeePay'] },
  xendit: { name: 'Xendit Payment Gateway', badge: 'Alternatif', description: 'Pilihan pembayaran multibank dan e-Wallet', channels: ['Mandiri Bill', 'BNI VA', 'BRI VA', 'OVO', 'DANA'] },
}
export function PaymentMethodOption({ method, selected, disabled, onChange }: { method: PaymentMethod; selected: boolean; disabled?: boolean; onChange: (method: PaymentMethod) => void }) {
  const gateway = gateways[method]
  return <label className={styles.option} data-selected={selected} data-method={method}><input type="radio" name="payment-method" value={method} checked={selected} disabled={disabled} onChange={() => onChange(method)} /><span className={styles.content}><span className={styles.top}><strong>{gateway.name}</strong><b className={styles.badge}>{gateway.badge}</b><small>Bebas Biaya Admin (Rp0)</small></span><span className={styles.description}>{gateway.description}</span><span className={styles.channels}>{gateway.channels.map(channel => <span key={channel}>{channel}</span>)}</span></span></label>
}
