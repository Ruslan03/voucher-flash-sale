import type { SaleVoucher } from '../domain/sale-voucher'
import type { VoucherDetailsRepository } from '../use-cases/voucher-details-repository'

const offers = {
  zara: { name: 'Zara / MAP Fashion & Lifestyle', category: 'fashion', categoryLabel: 'Fashion & Lifestyle', faceValue: 200000, price: 50000, minimumTransaction: 400000 },
  kopi: { name: 'Kopi Kenangan', category: 'food', categoryLabel: 'Food & Beverage', faceValue: 50000, price: 5000, minimumTransaction: 50000 },
  tokopedia: { name: 'Tokopedia', category: 'electronics', categoryLabel: 'Electronics', faceValue: 500000, price: 350000, minimumTransaction: 500000 },
  samsung: { name: 'Samsung', category: 'electronics', categoryLabel: 'Electronics', faceValue: 300000, price: 100000, minimumTransaction: 300000 },
  mcd: { name: "McDonald's", category: 'food', categoryLabel: 'Food & Beverage', faceValue: 60000, price: 10000, minimumTransaction: 60000 },
} as const

/** Local fixtures only. Replace this adapter after agreeing the backend contract. */
export class DemoVoucherDetailsRepository implements VoucherDetailsRepository {
  constructor(private readonly now: () => number = Date.now) {}
  async findById(id: string): Promise<SaleVoucher | null> {
    if (!Object.hasOwn(offers, id)) return null
    const offer = offers[id as keyof typeof offers], now = this.now()
    return { ...offer, mode: 'preview', id, description: 'Voucher belanja resmi untuk menikmati penawaran spesial di merchant favorit Anda.',
      validityDays: 7, merchantScope: id === 'zara' ? 'Berlaku di Zara, Massimo Dutti, Pull & Bear, Bershka, Mango dan MAP Club.' : `Berlaku di merchant ${offer.name} yang berpartisipasi.`,
      merchants: id === 'zara' ? ['Zara Grand Indonesia', 'Zara Senayan City', 'Zara Pondok Indah Mall', 'Zara Tunjungan Plaza Sby', 'MAPClub.com'] : [offer.name],
      terms: [
        { title: 'Quota Restriction', description: 'Setiap pengguna hanya dapat membeli satu voucher per kategori selama periode kampanye.' },
        { title: 'Non-Transferable', description: 'Voucher tidak dapat diuangkan, dikembalikan, atau dipindahtangankan.' },
        { title: 'Single Use', description: 'Satu kode voucher berlaku untuk satu transaksi checkout.' },
        { title: 'Discount Forfeiture', description: 'Sisa nilai voucher yang tidak digunakan akan hangus.' },
        { title: 'Stacking Exclusion', description: 'Tidak dapat digabung dengan promo bank, clearance, atau midnight sale tertentu.' },
      ], totalQuota: 3000, remainingQuota: id === 'mcd' ? 0 : 1204,
      startsAt: new Date(now - 360000).toISOString(), endsAt: new Date(now + 309000).toISOString(), fetchedAt: new Date(now).toISOString(), categoryUsed: false }
  }
}
