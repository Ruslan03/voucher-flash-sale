import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface NotificationState {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export interface AppSliceState {
  claimedVoucherIds: string[]
  notifications: NotificationState[]
}

const initialState: AppSliceState = {
  claimedVoucherIds: [],
  notifications: [],
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    voucherClaimed: (state, action: PayloadAction<string>) => {
      if (!state.claimedVoucherIds.includes(action.payload)) {
        state.claimedVoucherIds.push(action.payload)
      }
    },
    addNotification: (state, action: PayloadAction<NotificationState>) => {
      state.notifications.push(action.payload)
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
  },
})

export const { voucherClaimed, addNotification, dismissNotification } = appSlice.actions
export const appReducer = appSlice.reducer
