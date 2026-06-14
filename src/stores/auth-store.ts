import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { HoLinkUser } from '@/models'
import { generateId } from '@/utils/id'
import {
  loadAuth,
  saveAuth,
  findUserByUsername,
  saveSessionUser,
  clearSession,
  upsertUser,
} from '@/stores/holink-storage'
import { validatePassword, validateUsername } from '@/utils/validate-auth'

export const useAuthStore = defineStore('auth', () => {
  const authedUsername = ref<string | null>(null)
  const isLoading = ref<boolean>(false)

  const isAuthenticated = computed(() => !!authedUsername.value)

  function initialize(): void {
    isLoading.value = true
    try {
      const username = loadAuth()
      if (username) {
        authedUsername.value = username
      }
    } finally {
      isLoading.value = false
    }
  }

  function login(username: string, password: string): boolean {
    const normalized = username.trim().toLowerCase()
    const user = findUserByUsername(normalized)
    if (!user || user.password !== password) return false

    authedUsername.value = user.username
    saveAuth(user.username)
    saveSessionUser(user)
    return true
  }

  function register(username: string, password: string): boolean {
    const normalized = username.trim().toLowerCase()
    if (validateUsername(normalized, true) !== '' || validatePassword(password) !== '') return false

    const existing = findUserByUsername(normalized)
    if (existing) return false

    const newUser: HoLinkUser = {
      id: generateId(),
      username: normalized,
      displayName: normalized,
      bio: '',
      password,
      links: [],
      updatedAt: new Date().toISOString(),
    }

    upsertUser(newUser)
    saveSessionUser(newUser)

    authedUsername.value = newUser.username
    saveAuth(newUser.username)

    return true
  }

  function logout(): void {
    authedUsername.value = null
    saveAuth(null)
    clearSession()
  }

  function updateAuthedUsername(username: string): void {
    const normalized = username.trim()
    if (normalized.length === 0) return

    authedUsername.value = normalized
    saveAuth(normalized)
  }

  initialize()

  return {
    authedUsername,
    isAuthenticated,
    isLoading,
    initialize,
    login,
    register,
    logout,
    updateAuthedUsername,
  }
})
