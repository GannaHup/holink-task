<script lang="ts" setup>
defineOptions({ name: 'ProfileEditor' })

import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useHolinkStore } from '@/stores/holink-store'
import { useToast } from '@/composables/useToast'
import { validateSlug } from '@/utils/link'
import { IconDeviceFloppy, IconExternalLink, IconLoader2 } from '@tabler/icons-vue'
import AppInput from '@/components/ui/Input/index.vue'

const store = useHolinkStore()
const toast = useToast()

// ── Profile Form ─────────────────────────────────────────────────────────────
const isSaving = ref(false)

const formData = ref({
  username: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
})

onMounted(() => {
  if (store.currentUser) {
    formData.value.username = store.currentUser.username
    formData.value.displayName = store.currentUser.displayName
    formData.value.bio = store.currentUser.bio
    formData.value.avatarUrl = store.currentUser.avatarUrl ?? ''
  }
})

// ── Profile Validation ───────────────────────────────────────────────────────
const DISPLAY_NAME_MAX = 50
const BIO_MAX = 160

const usernameError = computed(() => {
  if (formData.value.username.length === 0) return 'Username is required'
  const result = validateSlug(formData.value.username)
  return result.isValid ? '' : (result.error ?? 'Invalid username')
})

const displayNameError = computed(() => {
  if (formData.value.displayName.length === 0) return 'Display name is required'
  if (formData.value.displayName.length > DISPLAY_NAME_MAX)
    return `Max ${DISPLAY_NAME_MAX} characters`
  return ''
})

const bioError = computed(() => {
  if (formData.value.bio.length > BIO_MAX) return `Max ${BIO_MAX} characters`
  return ''
})

const isFormValid = computed(
  () =>
    usernameError.value === '' &&
    displayNameError.value === '' &&
    bioError.value === '' &&
    formData.value.username.length > 0 &&
    formData.value.displayName.length > 0,
)

async function handleSave(): Promise<void> {
  if (!isFormValid.value) return

  isSaving.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 400))

    store.updateProfile({
      username: formData.value.username,
      displayName: formData.value.displayName,
      bio: formData.value.bio,
      avatarUrl: formData.value.avatarUrl || undefined,
    })

    toast.success('Profile saved successfully!')
  } catch {
    toast.error('Failed to save profile.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 class="mb-6 text-lg font-semibold text-foreground">Edit Profile</h2>

      <form class="space-y-5" @submit.prevent="handleSave">
        <!-- Username -->
        <AppInput
          label="Username"
          prefix="@"
          v-model="formData.username"
          placeholder="your_username"
          :error="usernameError"
        />

        <!-- Display Name -->
        <AppInput
          label="Display Name"
          v-model="formData.displayName"
          placeholder="John Doe"
          :error="displayNameError"
        >
          <template #hint>
            <span
              :class="[
                'text-xs',
                formData.displayName.length > DISPLAY_NAME_MAX
                  ? 'font-medium text-destructive'
                  : 'text-muted-foreground',
              ]"
            >
              {{ formData.displayName.length }}/{{ DISPLAY_NAME_MAX }}
            </span>
          </template>
        </AppInput>

        <!-- Bio -->
        <AppInput
          label="Bio"
          multiline
          v-model="formData.bio"
          placeholder="Tell the world about yourself..."
          :error="bioError"
        >
          <template #hint>
            <span
              :class="[
                'text-xs',
                formData.bio.length > BIO_MAX
                  ? 'font-medium text-destructive'
                  : 'text-muted-foreground',
              ]"
            >
              {{ formData.bio.length }}/{{ BIO_MAX }}
            </span>
          </template>
        </AppInput>

        <!-- Avatar URL -->
        <AppInput
          label="Avatar URL"
          label-hint="(optional)"
          v-model="formData.avatarUrl"
          type="url"
          placeholder="https://example.com/avatar.jpg"
        />

        <!-- Actions -->
        <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <button
              type="submit"
              :disabled="!isFormValid || isSaving"
              :class="[
                'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors',
                isFormValid && !isSaving
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'cursor-not-allowed bg-indigo-300',
              ]"
            >
              <IconLoader2 v-if="isSaving" :size="16" class="animate-spin" />
              <IconDeviceFloppy v-else :size="16" />
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>

            <RouterLink
              v-if="store.currentUser?.username"
              :to="`/${store.currentUser.username}`"
              target="_blank"
              class="flex items-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <IconExternalLink :size="16" />
              Preview Public Page
            </RouterLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
