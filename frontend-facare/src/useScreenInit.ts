import { useMemo } from 'react'

export function useScreenInit() {
  return useMemo(() => {
    if (typeof window === 'undefined') return {}
    const screenId = new URLSearchParams(window.location.search).get('mp_screen')
    if (!screenId) return {}
    return {}
  }, [])
}