import { DashboardError, type DashboardSnapshot } from '../domain/dashboard'
import { failureResult, successResult, type ActionResult } from '@/shared/domain/result'
import { previewPurchase, type PreviewPurchase } from '../use-cases/preview-purchase'

export function previewPurchaseController(snapshot: DashboardSnapshot, id: string, now: number): ActionResult<PreviewPurchase> {
  try { return successResult(previewPurchase(snapshot, id, now)) }
  catch (error) {
    return failureResult(error instanceof DashboardError ? error.message : 'Preview pembelian gagal.', error instanceof DashboardError ? error.code : 'PREVIEW_FAILED')
  }
}
