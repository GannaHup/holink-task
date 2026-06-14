<script setup lang="ts">
defineOptions({ name: 'LoginView' })

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/composables/use-toast'
import { IconArrowRight } from '@tabler/icons-vue'
import { validateUsername, USERNAME_MAX } from '@/utils/validate-auth'
import Input from '@/components/Input/index.vue'
import Button from '@/components/Button/index.vue'
import ThemeToggle from '@/components/ThemeToggle/index.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

const username = ref('')
const password = ref('')
const isSubmitting = ref(false)

const usernameError = computed(() => validateUsername(username.value))

const isFormValid = computed(
  () => username.value.length > 0 && usernameError.value === '' && password.value.length > 0,
)

async function handleLogin(): Promise<void> {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  await new Promise((resolve) => setTimeout(resolve, 400))

  const success = auth.login(username.value.trim(), password.value)

  if (success) {
    toast.success(`Welcome back, @${username.value}!`)
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } else {
    toast.error('Invalid username or password.')
  }

  isSubmitting.value = false
}
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-center bg-linear-to-b from-indigo-50 to-gray-50 px-4 dark:from-gray-950 dark:to-gray-900"
  >
    <div class="absolute right-4 top-4">
      <ThemeToggle />
    </div>

    <div class="w-full max-w-md">
      <div class="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div class="mb-8 text-center">
          <h1
            class="bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-3xl font-bold text-transparent"
          >
            HoLink
          </h1>
          <p class="mt-2 text-sm text-muted-foreground">Sign in to manage your link-in-bio</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <Input
            v-model="username"
            label="Username"
            prefix="@"
            placeholder="your_username"
            :max-length="USERNAME_MAX"
          />

          <Input v-model="password" label="Password" type="password" placeholder="••••••••" />

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

        <p class="mt-6 text-center text-xs text-muted-foreground">
          New here?
          <RouterLink
            to="/register"
            class="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Create an account
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
