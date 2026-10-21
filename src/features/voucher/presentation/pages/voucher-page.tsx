import { createVoucherRepository } from '@/composition/registry'
import { getVouchers } from '../../use-cases/get-vouchers'
import { getVoucherById } from '../../use-cases/get-voucher-by-id'

interface VoucherPageProps {
  id?: string
}

export async function VoucherPage({ id }: VoucherPageProps) {
  const repo = createVoucherRepository()
  const vouchers = await getVouchers(repo)
  const sampleVoucher = id ? await getVoucherById(repo, id) : vouchers[0]

  return (
    <main
      data-testid="voucher-starter-screen"
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--surface-muted)] text-[var(--secondary-navy)]"
    >
      <div className="max-w-2xl w-full text-center space-y-6">
        {/* Ticker Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--canvas-base)] border border-[var(--border-default)] shadow-[var(--shadow-deal-resting)]">
          <span className="text-[#d70324] font-black text-sm">⚡</span>
          <span className="label-caps text-[var(--secondary-navy)] font-bold">
            Vibrant Flash Commerce &bull; Clean Architecture
          </span>
        </div>

        {/* Headline */}
        <div>
          <h1 className="display-hero text-[var(--secondary-navy)] tracking-tight">
            Feature <span className="text-[var(--primary-flash)]">Voucher</span>
          </h1>
          <p className="body-md text-[var(--neutral-core)] mt-2 max-w-lg mx-auto">
            Design system <strong>Vibrant Flash Commerce</strong> aktif dengan font <strong>Plus Jakarta Sans</strong>. Gunakan panduan arsitektur di bawah untuk mengimplementasikan fitur.
          </p>
        </div>

        {/* 4 Architectural Layers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          <div className="card-deal p-4">
            <span className="label-caps text-[var(--primary-flash)] font-bold">
              1. Domain Layer
            </span>
            <p className="body-sm text-[var(--secondary-navy)] font-medium mt-1">
              Atur model entitas &amp; aturan bisnis di <code className="text-xs bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded font-mono">domain/voucher.ts</code>
            </p>
          </div>

          <div className="card-deal p-4">
            <span className="label-caps text-[var(--primary-flash)] font-bold">
              2. Use Cases Layer
            </span>
            <p className="body-sm text-[var(--secondary-navy)] font-medium mt-1">
              Kontrak port <code className="text-xs bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded font-mono">voucher-repository.ts</code> &amp; use cases di <code className="text-xs bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded font-mono">use-cases/</code>
            </p>
          </div>

          <div className="card-deal p-4">
            <span className="label-caps text-[var(--primary-flash)] font-bold">
              3. Infrastructure
            </span>
            <p className="body-sm text-[var(--secondary-navy)] font-medium mt-1">
              Implementasi API / In-Memory adapters di <code className="text-xs bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded font-mono">infrastructure/</code>
            </p>
          </div>

          <div className="card-deal p-4">
            <span className="label-caps text-[var(--primary-flash)] font-bold">
              4. Controllers
            </span>
            <p className="body-sm text-[var(--secondary-navy)] font-medium mt-1">
              Server Actions penghubung UI di <code className="text-xs bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded font-mono">controllers/voucher-controller.ts</code>
            </p>
          </div>
        </div>

        {/* Active Data Connection Banner */}
        <div className="p-3.5 rounded-xl bg-[var(--canvas-base)] border border-[var(--border-default)] shadow-[var(--shadow-deal-resting)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--neutral-core)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[var(--secondary-navy)]">Entity Wiring Active:</span>
            <span>{sampleVoucher ? sampleVoucher.title : 'Ready'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[var(--surface-subtle)] font-mono text-[11px] text-[var(--secondary-navy)]">
              {vouchers.length} Records Connected
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
