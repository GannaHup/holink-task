<script setup lang="ts">
defineOptions({ name: 'LoginView' })

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHolinkStore } from '@/stores/holink-store'
import { useToast } from '@/composables/use-toast'
import { validateSlug } from '@/utils/link'
import { IconArrowRight } from '@tabler/icons-vue'
import Input from '@/components/Input/index.vue'
import Button from '@/components/Button/index.vue'
import ThemeToggle from '@/components/ThemeToggle/index.vue'
import Toast from '@/components/Toast/index.vue'

const router = useRouter()
const route = useRoute()
const store = useHolinkStore()
const toast = useToast()

// ── Refs & Reactive ──────────────────────────────────────────────────────────
const username = ref('')
const isSubmitting = ref(false)

// ── Computed ─────────────────────────────────────────────────────────────────
const usernameError = computed(() => {
  if (username.value.length === 0) return ''
  const result = validateSlug(username.value)
  return result.isValid ? '' : (result.error ?? 'Invalid username')
})

const isFormValid = computed(() => username.value.length > 0 && usernameError.value === '')

// ── Functions ────────────────────────────────────────────────────────────────
async function handleLogin(): Promise<void> {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  // Simulate a brief network round-trip to demonstrate loading state.
  await new Promise((resolve) => setTimeout(resolve, 400))

  const success = store.login(username.value.trim())

  if (success) {
    toast.success(`Welcome, @${store.currentUser?.username}!`)
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } else {
    toast.error('Could not sign in. Please try again.')
  }

  isSubmitting.value = false
}
</script>

<template>
  <Toast />

  <div
    class="relative flex min-h-screen items-center justify-center bg-linear-to-b from-indigo-50 to-gray-50 px-4 dark:from-gray-950 dark:to-gray-900"
  >
    <div class="absolute right-4 top-4">
      <ThemeToggle />
    </div>

    <div class="w-full max-w-md">
      <div class="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1
            class="bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-3xl font-bold text-transparent"
          >
            HoLink
          </h1>
          <p class="mt-2 text-sm text-muted-foreground">Sign in to manage your link-in-bio</p>
        </div>

        <!-- Form -->
        <form class="space-y-5" @submit.prevent="handleLogin">
          <Input
            v-model="username"
            label="Username"
            prefix="@"
            placeholder="your_username"
            :error="usernameError"
            :max-length="30"
          />

          <Button
            type="submit"
            class="w-full gap-2"
            :loading="isSubmitting"
            :disabled="!isFormValid"
          >
            <IconArrowRight v-if="!isSubmitting" :size="16" />
            {{ isSubmitting ? 'Signing in...' : 'Login' }}
          </Button>
        </form>

        <!-- Hint -->
        <p class="mt-6 text-center text-xs text-muted-foreground">
          New here? Just pick a username and we'll create your account.
        </p>
      </div>
    </div>
  </div>
</template>
