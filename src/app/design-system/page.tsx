import type { Metadata } from 'next'
import { DesignSystemPage } from '@/features/design-system/presentation/pages/design-system-page'

export const metadata: Metadata = {
  title: 'PromoRush — Design System',
  description: 'Foundations, atoms, and molecules from the PromoRush shared component library.',
}

export default function Page() {
  return <DesignSystemPage />
}
