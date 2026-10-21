import Image from 'next/image'
import flashSaleHero from '../../assets/flash-sale-hero.jpg'
import { VoucherPreview } from '@/shared/presentation/components/molecules/voucher-preview'
import styles from './voucher-showcase.module.css'

export function VoucherShowcase() {
  return (
    <div className={styles.showcase}>
      <div className={styles.visual}>
        <Image src={flashSaleHero} alt="PromoRush Mega Voucher Celebration Visual with exploding flash sale coupons and shopping gift box"
          className={styles.hero} sizes="(min-width: 1024px) 460px, 90vw" priority />
        <VoucherPreview merchant="Kopi Kenangan" promotion="90% OFF" originalPrice="Rp50,000" price="Rp5,000" icon="restaurant" tone="food" className={styles.food} />
        <VoucherPreview merchant="Zara / H&M" promotion="62% OFF" originalPrice="Rp200,000" price="Rp75,000" icon="checkroom" tone="fashion" className={styles.fashion} />
        <VoucherPreview merchant="Tokopedia / Gadget" promotion="SAVER" originalPrice="Rp500,000" price="Rp350,000" icon="devices" tone="electronics" className={styles.electronics} />
      </div>
    </div>
  )
}
