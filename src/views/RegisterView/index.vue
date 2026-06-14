<script setup lang="ts">
defineOptions({ name: 'RegisterView' })

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/composables/use-toast'
import { validateSlug } from '@/utils/link'
import { IconArrowRight } from '@tabler/icons-vue'
import Input from '@/components/Input/index.vue'
import Button from '@/components/Button/index.vue'
import ThemeToggle from '@/components/ThemeToggle/index.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const username = ref('')
const password = ref('')
const isSubmitting = ref(false)

const usernameError = computed(() => {
  if (username.value.length === 0) return ''
  const result = validateSlug(username.value)
  return result.isValid ? '' : (result.error ?? 'Invalid username')
})

const passwordError = computed(() => {
  if (password.value.length === 0) return ''
  if (password.value.length < 6) return 'Password must be at least 6 characters'
  return ''
})

const isFormValid = computed(
  () =>
    username.value.length > 0 &&
    usernameError.value === '' &&
    password.value.length >= 6 &&
    passwordError.value === '',
)

async function handleRegister(): Promise<void> {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  await new Promise((resolve) => setTimeout(resolve, 400))

  const success = auth.register(username.value.trim(), password.value)

  if (success) {
    toast.success(`Welcome, @${username.value}!`)
    router.push('/dashboard')
  } else {
    toast.error('Registration failed. Username might be taken or invalid.')
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
          <p class="mt-2 text-sm text-muted-foreground">Create your account</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">
          <Input
            v-model="username"
            label="Username"
            prefix="@"
            placeholder="your_username"
            :error="usernameError"
            :max-length="30"
          />

          <Input
            v-model="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            :error="passwordError"
          />

          <Button
            type="submit"
            class="w-full gap-2"
            :loading="isSubmitting"
            :disabled="!isFormValid"
          >
            <IconArrowRight v-if="!isSubmitting" :size="16" />
            {{ isSubmitting ? 'Registering...' : 'Register' }}
          </Button>
        </form>

        <p class="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?
          <RouterLink
            to="/login"
            class="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
