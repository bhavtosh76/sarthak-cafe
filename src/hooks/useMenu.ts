import { useCallback, useEffect, useState } from 'react'
import { FirebaseNotConfiguredError, isFirebaseConfigured } from '../config/firebase'
import { fetchMenuItems } from '../services/menu.service'
import type { MenuItem } from '../types'

/** Friendly, non-technical message for any thrown error. */
export function toFriendlyMessage(error: unknown): string {
  if (error instanceof FirebaseNotConfiguredError) return error.message
  if (error instanceof Error) {
    const code = (error as { code?: string }).code
    if (code?.includes('permission-denied'))
      return 'You do not have permission to do that. Check Firestore security rules.'
    if (code?.includes('unavailable'))
      return 'Could not reach Firebase. Check your connection and project id.'
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Loads the menu once on mount and exposes a manual `reload()`.
 * `data` is `null` while loading, an array (possibly demo data) afterwards.
 */
export function useMenu() {
  const [state, setState] = useState<AsyncState<MenuItem[]>>({ data: null, loading: true, error: null })
  // Bumped by `reload()` (event handlers) to refetch without setState-in-effect.
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const items = await fetchMenuItems()
        if (!cancelled) setState({ data: items, loading: false, error: null })
      } catch (error) {
        if (!cancelled) setState({ data: null, loading: false, error: toFriendlyMessage(error) })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tick])

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    setTick((value) => value + 1)
  }, [])

  return { ...state, reload, demoMode: !isFirebaseConfigured }
}
