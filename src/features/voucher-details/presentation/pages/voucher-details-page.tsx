import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { getVoucherDetailsController } from '../../controllers/voucher-details-controller'
import { VoucherDetailsView } from './voucher-details-view'
export async function VoucherDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params, result = await getVoucherDetailsController(id)
  if (!result.success && typeof result.error !== 'string' && result.error.code === 'NOT_FOUND') notFound()
  return <VoucherDetailsView key={id} id={id} initialResult={result} />
}
