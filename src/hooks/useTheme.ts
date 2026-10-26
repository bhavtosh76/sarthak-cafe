import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'sarthak-theme'

/** Current theme, honouring the value applied by the inline script in index.html. */
function readTheme(): Theme {
  const attr = document.documentElement.dataset.theme
  if (attr === 'light' || attr === 'dark') return attr
  return 'dark'
}

/**
 * Dark/light theme control.
 *
 * The initial value is set by the inline script in `index.html` (before first
 * paint, so there is no flash). This hook keeps React state in sync with the
 * `data-theme` attribute, persists the choice to localStorage and exposes a
 * toggle for the navbar button.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme)

  // Another tab toggled the theme → follow along.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
        setThemeState(event.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* private mode — the attribute still applies for this session */
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(readTheme() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  return { theme, setTheme, toggleTheme }
}
