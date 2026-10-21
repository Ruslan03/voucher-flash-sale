import type { ReactNode } from 'react'
import Link from 'next/link'
import { Badge } from '@/shared/presentation/components/atoms/badge'
import { Button } from '@/shared/presentation/components/atoms/button'
import { Icon, type IconName } from '@/shared/presentation/components/atoms/icon'
import { Input } from '@/shared/presentation/components/atoms/input'
import { FormField } from '@/shared/presentation/components/molecules/form-field'
import { PhoneNumberField } from '@/shared/presentation/components/molecules/phone-number-field'
import { VoucherPreview } from '@/shared/presentation/components/molecules/voucher-preview'
import './design-system.css'
import { OtpInputDemo } from '../components/otp-input-demo'
import { CategoryFilterDemo } from '../components/category-filter-demo'
import { Progress } from '@/shared/presentation/components/atoms/progress'

const navigation = [
  ['foundations', '01', 'Foundations'],
  ['atoms', '02', 'Atoms'],
  ['molecules', '03', 'Molecules'],
  ['usage', '04', 'Usage'],
] as const

const palette = [
  ['Flash red', '--primary-flash', '#D70324'],
  ['Midnight navy', '--secondary-navy', '#14213D'],
  ['Food orange', '--category-food', '#FF6B35'],
  ['Fashion pink', '--category-fashion', '#E01A67'],
  ['Electric blue', '--category-electronics', '#0066FF'],
  ['Canvas', '--canvas-base', '#FFFFFF'],
] as const

const iconNames: IconName[] = ['bolt', 'verified', 'schedule', 'local_fire_department',
  'timelapse', 'flash_on', 'restaurant', 'checkroom', 'devices', 'redeem', 'smartphone', 'info', 'arrow_forward', 'arrow_back', 'lock']

function Section({ id, number, title, description, children }: {
  id: string; number: string; title: string; description: string; children: ReactNode
}) {
  return (
    <section id={id} className="ds-section" aria-labelledby={`${id}-title`}>
      <header className="ds-section-heading">
        <span className="ds-section-number">{number}</span>
        <div><h2 id={`${id}-title`}>{title}</h2><p>{description}</p></div>
      </header>
      {children}
    </section>
  )
}

function Specimen({ name, description, code, children }: {
  name: string; description: string; code: string; children: ReactNode
}) {
  return (
    <article className="ds-specimen">
      <header><h3>{name}</h3><p>{description}</p></header>
      <div className="ds-preview">{children}</div>
      <details className="ds-code"><summary>View usage <span aria-hidden="true">↗</span></summary><pre><code>{code}</code></pre></details>
    </article>
  )
}

export function DesignSystemPage() {
  return (
    <div className="ds-page">
      <a className="ds-skip" href="#ds-content">Skip to components</a>
      <header className="ds-topbar">
        <Link href="/design-system" className="ds-brand"><span className="ds-brand-mark"><Icon name="bolt" /></span>PromoRush<span className="ds-brand-divider" /><span className="ds-brand-caption">Design system</span></Link>
        <Link href="/login" className="ds-preview-link">View login <Icon name="arrow_forward" /></Link>
      </header>

      <div className="ds-layout">
        <aside className="ds-sidebar">
          <p className="ds-eyebrow">Component library</p>
          <nav aria-label="Design system sections">
            {navigation.map(([id, number, label]) => <a key={id} href={`#${id}`}><span>{number}</span>{label}</a>)}
          </nav>
          <div className="ds-sidebar-note"><Icon name="redeem" /><p>Small pieces.<br /><strong>One consistent experience.</strong></p></div>
          <code>src/shared/presentation</code>
        </aside>

        <main id="ds-content" className="ds-content">
          <section className="ds-hero" aria-labelledby="ds-title">
            <Badge className="ds-hero-badge"><span className="ds-status-dot" />VIBRANT FLASH COMMERCE</Badge>
            <h1 id="ds-title">Built for the rush.<br /><span>Designed to connect.</span></h1>
            <p>The building blocks behind PromoRush. Explore the foundations, reusable atoms, and composed molecules that keep every screen connected.</p>
            <div className="ds-hero-meta"><span><strong>05</strong> atoms</span><span><strong>05</strong> molecules</span><span><Icon name="bolt" />Atomic Design</span></div>
          </section>

          <Section id="foundations" number="01" title="Foundations" description="The visual language behind every component. Shared tokens, consistent decisions.">
            <h3 className="ds-subheading">Color palette <span>Brand & category accents</span></h3>
            <div className="ds-palette">
              {palette.map(([name, token, hex]) => (
                <div className="ds-swatch" key={token}>
                  <div className="ds-swatch-color" style={{ background: `var(${token})` }} />
                  <strong>{name}</strong><span>{hex}</span><code>{token}</code>
                </div>
              ))}
            </div>
            <div className="ds-foundation-grid">
              <article className="ds-type-card">
                <div className="ds-card-label">Typography <span>Plus Jakarta Sans</span></div>
                <div className="ds-type-sample">Aa<span>0123456789</span></div>
                <div className="ds-type-row"><span className="headline-lg">Made for the moment.</span><code>headline-lg</code></div>
                <div className="ds-type-row"><span className="body-md">Clear, friendly, and ready for the rush.</span><code>body-md</code></div>
                <div className="ds-type-row"><span className="price-xl">Rp75,000</span><code>price-xl</code></div>
              </article>
              <article className="ds-type-card">
                <div className="ds-card-label">Shape & spacing <span>Existing CSS tokens</span></div>
                <div className="ds-radius-grid">
                  {[['--radius-sm', '4px'], ['--radius-md', '8px'], ['--radius-lg', '12px'], ['--radius-full', 'Pill']].map(([token, label]) => <div key={token}><span style={{ borderRadius: `var(${token})` }} /><strong>{label}</strong><code>{token}</code></div>)}
                </div>
                <p className="ds-note">Use the shared surface, border, and category tokens. Keep layout spacing in the composing page.</p>
              </article>
            </div>
          </Section>

          <Section id="atoms" number="02" title="Atoms" description="Small, reusable primitives. Native HTML props with a consistent visual foundation.">
            <Specimen name="Button" description="Primary, secondary, outline, and disabled. Defaults to type=button. Demo buttons do not submit data."
              code={'import { Button } from \'@/shared/presentation/components/atoms/button\'\n\n<Button>Claim voucher</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="outline">Outline</Button>\n<Button disabled>Unavailable</Button>'}>
              <div className="ds-row"><Button><Icon name="bolt" />Claim voucher</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button disabled>Unavailable</Button></div>
            </Specimen>
            <div className="ds-two-columns">
              <Specimen name="Input" description="Native inputs with keyboard focus, error, and disabled states."
                code={'import { Input } from \'@/shared/presentation/components/atoms/input\'\n\n<label htmlFor="name">Your name</label>\n<Input id="name" name="name" placeholder="Enter your name" />'}>
                <div className="ds-stack">
                  <label className="ds-demo-label" htmlFor="ds-input">Default<Input id="ds-input" placeholder="Type something here…" /></label>
                  <label className="ds-demo-label" htmlFor="ds-input-invalid">Invalid<Input id="ds-input-invalid" defaultValue="Invalid value" aria-invalid="true" aria-describedby="ds-input-error" /></label>
                  <p id="ds-input-error" className="ds-error">Example validation error.</p>
                  <label className="ds-demo-label" htmlFor="ds-input-disabled">Disabled<Input id="ds-input-disabled" placeholder="Unavailable" disabled /></label>
                </div>
              </Specimen>
              <Specimen name="Badge" description="Composable labels. Color and shape are supplied by the caller."
                code={'import { Badge } from \'@/shared/presentation/components/atoms/badge\'\n\n<Badge className="rounded-full bg-surface-container-low px-3 py-1">\n  <Icon name="verified" /> Verified platform\n</Badge>'}>
                <div className="ds-badge-examples"><Badge className="ds-demo-badge ds-demo-badge--red"><Icon name="bolt" />Flash sale</Badge><Badge className="ds-demo-badge ds-demo-badge--navy"><Icon name="verified" />Verified platform</Badge><Badge className="ds-demo-badge ds-demo-badge--orange">90% OFF</Badge><Badge className="ds-demo-badge ds-demo-badge--blue"><Icon name="schedule" />12:00–12:15 WIB</Badge></div>
              </Specimen>
            </div>
            <Specimen name="Progress" description="Native progress with dynamic value/max attributes and an accessible label. No inline styles."
              code={'import { Progress } from \'@/shared/presentation/components/atoms/progress\'\n\n<Progress value={68} max={100} aria-label="Kuota terpakai" />'}>
              <Progress value={68} max={100} aria-label="Kuota terpakai" />
            </Specimen>
            <Specimen name="Icon" description="Material Symbols Outlined, bundled locally. Decorative by default; supply label for standalone meaning."
              code={'import { Icon } from \'@/shared/presentation/components/atoms/icon\'\n\n<Icon name="bolt" />\n<Icon name="verified" label="Verified platform" />'}>
              <div className="ds-icon-grid">{iconNames.map(name => <div key={name}><Icon name={name} className="text-[28px]" /><code>{name}</code></div>)}</div>
            </Specimen>
          </Section>

          <Section id="molecules" number="03" title="Molecules" description="Atoms working together. Clear labels, connected help text, and reusable promotional content.">
            <div className="ds-two-columns">
              <Specimen name="FormField" description="A label, a control, and helpful context. Associate help text through aria-describedby."
                code={'<FormField id="merchant" label="Merchant" hint="Use the registered name.">\n  <Input id="merchant" aria-describedby="merchant-hint" />\n</FormField>'}>
                <FormField id="ds-merchant" label="Merchant name" hint="Use the registered merchant name."><Input id="ds-merchant" placeholder="e.g. Kopi Kenangan" aria-describedby="ds-merchant-hint" /></FormField>
              </Specimen>
              <Specimen name="PhoneNumberField" description="Indonesia +62 prefix, native input props, and automatically linked hint/error text."
                code={'<PhoneNumberField id="mobile" name="mobile"\n  label="Mobile phone number" hint="Use your active number." />\n\n<PhoneNumberField id="retry" label="Mobile phone number"\n  error="Check your mobile number." />'}>
                <div className="ds-stack"><PhoneNumberField id="ds-phone" label="Mobile phone number" hint="We’ll send a verification code to this number." /><PhoneNumberField id="ds-phone-error" label="With validation error" defaultValue="123" error="Check your mobile number." /></div>
              </Specimen>
            </div>
            <Specimen name="CategoryFilter" description="Generic filter buttons with controlled state and aria-pressed. Filtering data belongs to the caller."
              code={'<CategoryFilter value={category} onChange={setCategory}\n  options={[{ value: \'all\', label: \'Semua Kupon\', icon: \'confirmation_number\' }]} />'}>
              <CategoryFilterDemo />
            </Specimen>
            <Specimen name="OtpInput" description="Controlled digit boxes with paste, autofill, automatic focus, and keyboard navigation. Verification stays in the feature."
              code={'import { OtpInput } from \'@/shared/presentation/components/molecules/otp-input\'\n\nconst [digits, setDigits] = useState<string[]>(Array(6).fill(\'\'))\n<OtpInput id="code" value={digits} onChange={setDigits}\n  label="6-Digit Security Code" />'}>
              <OtpInputDemo />
            </Specimen>
            <Specimen name="VoucherPreview" description="Display-only content with three category tones. The caller supplies formatted prices and promotional copy."
              code={'<VoucherPreview merchant="Kopi Kenangan" promotion="90% OFF"\n  originalPrice="Rp50,000" price="Rp5,000"\n  icon="restaurant" tone="food" />'}>
              <div className="ds-voucher-grid">
                <VoucherPreview merchant="Kopi Kenangan" promotion="90% OFF" originalPrice="Rp50,000" price="Rp5,000" icon="restaurant" tone="food" />
                <VoucherPreview merchant="Zara / H&M" promotion="62% OFF" originalPrice="Rp200,000" price="Rp75,000" icon="checkroom" tone="fashion" />
                <VoucherPreview merchant="Tokopedia / Gadget" promotion="SAVER" originalPrice="Rp500,000" price="Rp350,000" icon="devices" tone="electronics" />
              </div>
            </Specimen>
          </Section>

          <Section id="usage" number="04" title="Compose with intention" description="Keep shared components small. Let features own the experience.">
            <div className="ds-guidelines">
              {[['01', 'Start with an atom', 'Import directly from atoms/ or molecules/. Reuse native props before adding a new abstraction.'], ['02', 'Compose in the feature', 'Page layout, form state, API calls, validation, and price formatting belong in features/.'], ['03', 'Keep access built in', 'Use visible labels, linked help text, keyboard focus, and reduced-motion preferences.']].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
            </div>
            <div className="ds-composition-note"><Icon name="info" /><p>The current library contains atoms and molecules. Organisms and templates can be extracted when a repeated composition needs them.</p></div>
          </Section>
          <footer className="ds-footer"><span>PromoRush · Shared presentation library</span><a href="#ds-title">Back to top ↑</a></footer>
        </main>
      </div>
    </div>
  )
}
