import type { StoredState } from './types'

const STORAGE_KEY = 'thinktank.pipeline.v1'

export const loadStoredState = (): StoredState | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredState
  } catch {
    return null
  }
}

export const saveStoredState = (state: StoredState) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const clearStoredState = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
