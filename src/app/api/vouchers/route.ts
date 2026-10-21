import { NextResponse } from 'next/server'
import { getVouchersController } from '@/features/voucher/controllers/voucher-controller'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? undefined

  const result = await getVouchersController(category)

  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result.data)
}
