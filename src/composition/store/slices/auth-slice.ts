import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  phone: string | null
  expiresIn: number | null
  isAuthenticated: boolean
  loginAt: string | null
}

export interface SetCredentialsPayload {
  accessToken: string
  refreshToken?: string
  phone: string
  expiresIn?: number
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  phone: null,
  expiresIn: null,
  isAuthenticated: false,
  loginAt: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<SetCredentialsPayload>
    ) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken ?? null
      state.phone = action.payload.phone
      state.expiresIn = action.payload.expiresIn ?? null
      state.isAuthenticated = true
      state.loginAt = new Date().toISOString()
    },
    logout: (state) => {
      state.accessToken = null
      state.refreshToken = null
      state.phone = null
      state.expiresIn = null
      state.isAuthenticated = false
      state.loginAt = null
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export const authReducer = authSlice.reducer
