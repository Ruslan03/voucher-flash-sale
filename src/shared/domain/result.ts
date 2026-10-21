/**
 * SHARED DOMAIN LAYER — Standardized Result DTO Pattern
 * Eliminates uncaught exceptions across architectural layer boundaries.
 */

export type ActionResult<T = void> =
  | { success: true; data: T; result?: T }
  | { success: false; error: { code: string; message: string } | string }

export function successResult<T>(data: T): ActionResult<T> {
  return { success: true, data, result: data }
}

export function failureResult<T = void>(
  message: string,
  code: string = 'UNKNOWN_ERROR'
): ActionResult<T> {
  return { success: false, error: { code, message } }
}
