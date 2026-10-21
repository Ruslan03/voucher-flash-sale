import { Badge } from '../atoms/badge'
import { Icon, type IconName } from '../atoms/icon'

interface VoucherPreviewProps {
  merchant: string
  promotion: string
  originalPrice: string
  price: string
  icon: IconName
  tone: 'food' | 'fashion' | 'electronics'
  className?: string
}

/** Display-only promotional content; prices are formatted by the caller. */
export function VoucherPreview({ merchant, promotion, originalPrice, price, icon, tone, className = '' }: VoucherPreviewProps) {
  return (
    <div className={`ui-voucher ui-voucher--${tone} ${className}`}>
      <span className="ui-voucher__icon"><Icon name={icon} className="text-[20px]" /></span>
      <div className="leading-tight">
        <div className="flex items-center gap-1">
          <span className="ui-voucher__merchant">{merchant}</span>
          <Badge className="ui-voucher__badge">{promotion}</Badge>
        </div>
        <p className="ui-voucher__price">{originalPrice} → <strong>{price}</strong></p>
      </div>
    </div>
  )
}
