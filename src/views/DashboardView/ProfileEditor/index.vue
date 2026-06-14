<script lang="ts" setup>
defineOptions({ name: 'ProfileEditor' })

import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useHolinkStore } from '@/stores/holink-store'
import { useToast } from '@/composables/use-toast'
import { useDisclosure } from '@/composables/use-disclosure'
import { validateUsername } from '@/utils/validate'
import { IconDeviceFloppy, IconExternalLink } from '@tabler/icons-vue'
import Input from '@/components/Input/index.vue'
import Textarea from '@/components/Textarea/index.vue'
import Button from '@/components/Button/index.vue'

const DISPLAY_NAME_MAX = 50
const BIO_MAX = 160

const store = useHolinkStore()
const toast = useToast()
const { isOpen: isSaving, onOpen: onSavingStart, onClose: onSavingEnd } = useDisclosure()

const formData = ref({
  username: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
})

const usernameError = computed(() => validateUsername(formData.value.username, true))

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

  onSavingStart()

  const result = await store.updateProfile({
    username: formData.value.username,
    displayName: formData.value.displayName,
    bio: formData.value.bio,
    avatarUrl: formData.value.avatarUrl || undefined,
  })

  if (result.success) {
    toast.success('Profile saved successfully!')
  } else {
    toast.error(result.error ?? 'Failed to save profile.')
  }

  onSavingEnd()
}

onMounted(() => {
  if (store.currentUser) {
    formData.value = {
      username: store.currentUser.username,
      displayName: store.currentUser.displayName,
      bio: store.currentUser.bio,
      avatarUrl: store.currentUser.avatarUrl ?? '',
    }
  }
})
</script>

<template>
  <div>
    <div class="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 class="mb-6 text-lg font-semibold text-foreground">Edit Profile</h2>

      <form class="space-y-5" @submit.prevent="handleSave">
        <Input
          label="Username"
          prefix="@"
          v-model="formData.username"
          placeholder="your_username"
          :error="usernameError"
        />

        <Input
          label="Display Name"
          v-model="formData.displayName"
          placeholder="John Doe"
          :max-length="DISPLAY_NAME_MAX"
          :error="displayNameError"
        />

        <Textarea
          label="Bio"
          v-model="formData.bio"
          placeholder="Tell the world about yourself..."
          :max-length="BIO_MAX"
          :error="bioError"
        />

        <Input
          label="Avatar URL"
          label-hint="(optional)"
          v-model="formData.avatarUrl"
          type="url"
          placeholder="https://example.com/avatar.jpg"
        />

        <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <Button
              type="submit"
              class="w-full sm:w-auto"
              :loading="isSaving"
              :disabled="!isFormValid"
            >
              <IconDeviceFloppy v-if="!isSaving" :size="16" />
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </Button>

            <RouterLink
              v-if="store.currentUser?.username"
              :to="`/${store.currentUser.username}`"
              target="_blank"
              class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:w-auto"
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
