import { getCheckoutController } from '@/features/checkout/public'
import { OrderPaymentStatusView } from './order-payment-status-view'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { getPaymentStatusController } from '../../controllers/payment-status-controller'
import { PaymentStatusView } from './payment-status-view'
export async function PaymentStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  await connection()
  const { orderId } = await params
  if (['zara', 'demo-order', 'demo-failed', 'demo-pending'].includes(orderId)) {
    return <OrderPaymentStatusView key={orderId} id={orderId} initialResult={await getCheckoutController(orderId)} />
  }
  const result = await getPaymentStatusController(orderId)
  if (!result.success && typeof result.error !== 'string' && ['NOT_FOUND', 'INVALID_ID'].includes(result.error.code)) notFound()
  return <PaymentStatusView key={orderId} id={orderId} initialResult={result} />
}
