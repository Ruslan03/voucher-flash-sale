import type { DashboardCategory } from '../../domain/dashboard'
import type { IconName } from '@/shared/presentation/components/atoms/icon'

export const categories: { value: DashboardCategory; label: string; short: string; icon: IconName }[] = [
  { value: 'food', label: 'Makanan & Minuman', short: 'F&B', icon: 'local_cafe' },
  { value: 'fashion', label: 'Fashion', short: 'Fashion', icon: 'styler' },
  { value: 'electronics', label: 'Elektronik', short: 'Elektronik', icon: 'smartphone' },
]
