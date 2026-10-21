'use client'

import { useState } from 'react'
import { CategoryFilter } from '@/shared/presentation/components/molecules/category-filter'

export function CategoryFilterDemo() {
  const [category, setCategory] = useState('all')
  return <CategoryFilter value={category} onChange={setCategory} label="Demo kategori" options={[
    { value: 'all', label: 'Semua Kupon', icon: 'confirmation_number' },
    { value: 'food', label: 'Makanan & Minuman', icon: 'local_cafe' },
    { value: 'fashion', label: 'Fashion', icon: 'styler' },
    { value: 'electronics', label: 'Elektronik', icon: 'smartphone' },
  ]} />
}
