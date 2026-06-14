<script setup lang="ts">
defineOptions({ name: 'ProfileHeader' })

import { ref } from 'vue'
import type { HoLinkUser } from '@/models'

const props = defineProps<{
  user: HoLinkUser | null
  username: string
}>()

const hasImageError = ref(false)
</script>

<template>
  <div class="mb-8 text-center">
    <div
      v-if="props.user?.avatarUrl && !hasImageError"
      class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full ring-4 ring-indigo-100"
    >
      <img
        :src="props.user.avatarUrl"
        :alt="props.user.displayName"
        class="h-full w-full object-cover"
        @error="hasImageError = true"
      />
    </div>
    <div
      v-else
      class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600 ring-4 ring-indigo-50"
    >
      {{ props.user?.displayName?.charAt(0)?.toUpperCase() ?? '?' }}
    </div>
    <h1 class="text-xl font-bold text-gray-900">
      {{ props.user?.displayName ?? 'Unknown User' }}
    </h1>
    <p class="mt-1 text-sm text-gray-500">@{{ props.username }}</p>
    <p v-if="props.user?.bio" class="mx-auto mt-3 max-w-md text-sm text-gray-600">
      {{ props.user.bio }}
    </p>
  </div>
</template>
