'use client'

import { useStoreContext } from './provider'
import type { AppAction, AppState } from './index'

export function useAppState<T>(selector: (state: AppState) => T): T {
  const { state } = useStoreContext()
  return selector(state)
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const { dispatch } = useStoreContext()
  return dispatch
}
