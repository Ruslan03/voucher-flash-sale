import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { getCheckoutController } from '../../controllers/checkout-controller'
import { CheckoutView } from './checkout-view'
export async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params, result = await getCheckoutController(id)
  if (!result.success && typeof result.error !== 'string' && ['NOT_FOUND', 'INVALID_ID'].includes(result.error.code)) notFound()
  return <CheckoutView key={id} id={id} initialResult={result} />
}
