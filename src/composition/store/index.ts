/**
 * COMPOSITION ROOT — Centralized Redux Store with Persistor
 * Configured with redux-persist to retain authentication state across page reloads.
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from './storage'
import { authReducer } from './slices/auth-slice'
import { appReducer } from './slices/app-slice'

const rootReducer = combineReducers({
  auth: authReducer,
  app: appReducer,
})

const persistConfig = {
  key: 'promorush_state',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist authentication state
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export * from './slices/auth-slice'
export * from './slices/app-slice'
export * from './hooks'

