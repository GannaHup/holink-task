import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  type Theme,
  THEME_STORAGE_KEY,
  applyThemeClass,
  getStoredTheme,
  getSystemTheme,
} from '@/utils/theme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light')

  const isDark = computed<boolean>(() => theme.value === 'dark')

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

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (event: MediaQueryListEvent) => {
        if (!getStoredTheme()) {
          const next: Theme = event.matches ? 'dark' : 'light'
          theme.value = next
          applyThemeClass(next)
        }
      }
      mql.addEventListener('change', handler)
    }
  }

  initialize()

  return {
    theme,
    isDark,
    setTheme,
    toggle,
  }
})
