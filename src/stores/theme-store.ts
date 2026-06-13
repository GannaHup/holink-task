import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// ─── Constants ──────────────────────────────────────────────────────────────
const THEME_STORAGE_KEY = 'holink_theme'

type Theme = 'light' | 'dark'

// ─── DOM Helpers ────────────────────────────────────────────────────────────

function applyThemeClass(theme: Theme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

function getStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch (error) {
    console.error('[HoLink] Failed to read theme from localStorage:', error)
  }
  return null
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useThemeStore = defineStore('theme', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const theme = ref<Theme>('light')

  // ── Getters ───────────────────────────────────────────────────────────────
  const isDark = computed<boolean>(() => theme.value === 'dark')

  // ── Actions ───────────────────────────────────────────────────────────────

  function setTheme(next: Theme): void {
    theme.value = next
    applyThemeClass(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch (error) {
      console.error('[HoLink] Failed to persist theme:', error)
    }
  }

  function toggle(): void {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function initialize(): void {
    const stored = getStoredTheme()
    const initial: Theme = stored ?? getSystemTheme()
    theme.value = initial
    applyThemeClass(initial)

    // Sync with system changes only if the user hasn't explicitly chosen.
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (event: MediaQueryListEvent) => {
        if (!getStoredTheme()) {
          const next: Theme = event.matches ? 'dark' : 'light'
          theme.value = next
          applyThemeClass(next)
        }
      }
      // addEventListener is widely supported; addListener is the legacy fallback.
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', handler)
      } else if (typeof mql.addListener === 'function') {
        mql.addListener(handler)
      }
    }
  }

  // ── Initialize on creation ────────────────────────────────────────────────
  initialize()

  // ── Expose ────────────────────────────────────────────────────────────────
  return {
    theme,
    isDark,
    setTheme,
    toggle,
  }
})
