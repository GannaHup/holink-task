<script lang="ts" setup>
defineOptions({ name: 'ProfileEditor' })

import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useHolinkStore } from '@/stores/holink-store'
import { useToast } from '@/composables/use-toast'
import {
  DISPLAY_NAME_MAX,
  BIO_MAX,
  validateUsername,
  validateDisplayName,
  validateBio,
  validateAvatarUrl,
} from '@/utils/validate'
import { IconDeviceFloppy, IconExternalLink } from '@tabler/icons-vue'
import Input from '@/components/Input/index.vue'
import Textarea from '@/components/Textarea/index.vue'
import Button from '@/components/Button/index.vue'

const store = useHolinkStore()
const toast = useToast()

const formData = ref({
  username: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
})

const usernameError = computed(() => validateUsername(formData.value.username, true))

const displayNameError = computed(() => validateDisplayName(formData.value.displayName, true))

const bioError = computed(() => validateBio(formData.value.bio))

const avatarUrlError = computed(() => validateAvatarUrl(formData.value.avatarUrl || ''))

const isFormValid = computed(
  () =>
    usernameError.value === '' &&
    displayNameError.value === '' &&
    bioError.value === '' &&
    avatarUrlError.value === '',
)

async function handleSave() {
  if (!isFormValid.value) return

  const result = await store.updateProfile({
    username: formData.value.username.trim(),
    displayName: formData.value.displayName.trim(),
    bio: formData.value.bio.trim(),
    avatarUrl: formData.value.avatarUrl.trim(),
  })

  if (result.success) {
    toast.success('Profile updated successfully!')
  } else {
    toast.error(result.error || 'Failed to update profile')
  }
}

onMounted(() => {
  if (store.currentUser) {
    formData.value = {
      username: store.currentUser.username,
      displayName: store.currentUser.displayName,
      bio: store.currentUser.bio,
      avatarUrl: store.currentUser.avatarUrl || '',
    }
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-xl font-semibold">Profile Settings</h2>
      <RouterLink
        v-if="store.currentUser"
        :to="`/${store.currentUser.username}`"
        target="_blank"
        class="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <IconExternalLink :size="16" />
        View Public Profile
      </RouterLink>
    </div>

    <form
      @submit.prevent="handleSave"
      class="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6"
    >
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

      <div class="md:col-span-2">
        <Textarea
          label="Bio"
          v-model="formData.bio"
          placeholder="Tell the world about yourself..."
          :max-length="BIO_MAX"
          :error="bioError"
        />
      </div>

      <div class="md:col-span-2">
        <Input
          label="Avatar URL"
          label-hint="(optional)"
          v-model="formData.avatarUrl"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          :error="avatarUrlError"
        />
      </div>

      <div class="flex justify-end pt-2">
        <Button type="submit" :disabled="!isFormValid" class="w-full gap-2 sm:w-auto">
          <IconDeviceFloppy :size="18" />
          Save Profile
        </Button>
      </div>
    </form>
  </div>
</template>
