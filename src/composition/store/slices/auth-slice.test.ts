import { describe, expect, it } from 'vitest'
import { authReducer, setCredentials, logout, type AuthState } from './auth-slice'

describe('authSlice', () => {
  const initialState: AuthState = {
    accessToken: null,
    refreshToken: null,
    phone: null,
    expiresIn: null,
    isAuthenticated: false,
    loginAt: null,
  }

  it('handles initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('sets credentials on successful login', () => {
    const payload = {
      accessToken: 'jwt_access_token_123',
      refreshToken: 'jwt_refresh_token_456',
      phone: '08123456789',
      expiresIn: 3600,
    }

    const state = authReducer(initialState, setCredentials(payload))

    expect(state.accessToken).toBe('jwt_access_token_123')
    expect(state.refreshToken).toBe('jwt_refresh_token_456')
    expect(state.phone).toBe('08123456789')
    expect(state.expiresIn).toBe(3600)
    expect(state.isAuthenticated).toBe(true)
    expect(state.loginAt).not.toBeNull()
  })

  it('clears credentials on logout', () => {
    const loggedInState: AuthState = {
      accessToken: 'token',
      refreshToken: 'refresh',
      phone: '08123456789',
      expiresIn: 3600,
      isAuthenticated: true,
      loginAt: '2026-10-21T10:00:00Z',
    }

    const state = authReducer(loggedInState, logout())

    expect(state.accessToken).toBeNull()
    expect(state.phone).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.loginAt).toBeNull()
  })
})
