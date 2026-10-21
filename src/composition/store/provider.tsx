'use client'

import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import { appReducer, initialAppState, type AppAction, type AppState } from './index'

interface StoreContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const StoreContext = createContext<StoreContextType | null>(null)

export function RootProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState)

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStoreContext(): StoreContextType {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStoreContext must be used within RootProvider')
  }
  return context
}
