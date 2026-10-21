import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { getPaymentStatusController } from '../../controllers/payment-status-controller'
import { PaymentStatusView } from './payment-status-view'
export async function PaymentStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  await connection()
  const { orderId } = await params
  const result = await getPaymentStatusController(orderId)
  if (!result.success && typeof result.error !== 'string' && ['NOT_FOUND', 'INVALID_ID'].includes(result.error.code)) notFound()
  return <PaymentStatusView key={orderId} id={orderId} initialResult={result} />
}
