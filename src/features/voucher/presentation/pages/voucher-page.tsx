import { createVoucherRepository } from '@/composition/registry'
import { getVouchers } from '../../use-cases/get-vouchers'
import { getVoucherById } from '../../use-cases/get-voucher-by-id'

interface VoucherPageProps {
  id?: string
}

export async function VoucherPage({ id }: VoucherPageProps) {
  const repo = createVoucherRepository()
  const vouchers = await getVouchers(repo)
  const data = id ? await getVoucherById(repo, id) : vouchers[0]

  return (
    <main
      data-testid="voucher-starter-screen"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem 1.5rem',
        backgroundColor: '#0a0a0a',
        color: '#ededed',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '0.85rem',
            color: '#a1a1aa',
            marginBottom: '1.25rem',
          }}
        >
          <span>⚡</span>
          <span>Clean Architecture &bull; Feature Ready</span>
        </div>

        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            margin: '0 0 0.75rem',
            letterSpacing: '-0.025em',
          }}
        >
          Feature <span style={{ color: '#38bdf8' }}>Voucher</span>
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#a1a1aa',
            margin: '0 0 2rem',
            lineHeight: 1.5,
          }}
        >
          Kerangka arsitektur terpasang. Gunakan petunjuk di bawah untuk mengimplementasikan logika bisnis dan UI.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.85rem',
            textAlign: 'left',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              padding: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: '#38bdf8',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              1. Domain
            </span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Atur entity model &amp; aturan bisnis di <code>src/features/voucher/domain/</code>
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              padding: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: '#38bdf8',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              2. Use Cases
            </span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Definisikan kontrak port &amp; use case di <code>src/features/voucher/use-cases/</code>
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              padding: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: '#38bdf8',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              3. Infrastructure
            </span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Implementasi API / Database adapters di <code>src/features/voucher/infrastructure/</code>
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              padding: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: '#38bdf8',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              4. Controllers
            </span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Server Actions penghubung UI di <code>src/features/voucher/controllers/</code>
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            color: '#a1a1aa',
          }}
        >
          Status Entity: <strong style={{ color: '#34d399' }}>Active</strong> &bull; Sample: <code>{data ? data.title : 'Ready'}</code> &bull; Total: <code>{vouchers.length} Items</code>
        </div>
      </div>
    </main>
  )
}
