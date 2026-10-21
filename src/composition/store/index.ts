/**
 * COMPOSITION ROOT — Client UI State Store
 * Centralized client-side state aggregator.
 */

export interface NotificationState {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export interface AppState {
  claimedVoucherIds: string[]
  notifications: NotificationState[]
}

export type AppAction =
  | { type: 'VOUCHER_CLAIMED'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationState }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }

export const initialAppState: AppState = {
  claimedVoucherIds: [],
  notifications: [],
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'VOUCHER_CLAIMED':
      if (state.claimedVoucherIds.includes(action.payload)) return state
      return {
        ...state,
        claimedVoucherIds: [...state.claimedVoucherIds, action.payload],
      }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      }
    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      }
    default:
      return state
  }
}
