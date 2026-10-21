import { Suspense } from 'react'
import { LoginPage } from '@/features/login/presentation/pages/login-page'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  )
}
