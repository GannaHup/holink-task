<script setup lang="ts">
defineOptions({ name: 'ProfileHeader' })

import type { HoLinkUser } from '@/types'

const props = defineProps<{
  user: HoLinkUser | null
  username: string
}>()
</script>

<template>
  <div class="mb-8 text-center">
    <div
      v-if="props.user?.avatarUrl"
      class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full ring-4 ring-indigo-100 dark:ring-indigo-500/20"
    >
      <img
        :src="props.user.avatarUrl"
        :alt="props.user.displayName"
        class="h-full w-full object-cover"
      />
    </div>
    <div
      v-else
      class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600 ring-4 ring-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/10"
    >
      {{ props.user?.displayName?.charAt(0)?.toUpperCase() ?? '?' }}
    </div>
    <h1 class="text-xl font-bold text-foreground">
      {{ props.user?.displayName ?? 'Unknown User' }}
    </h1>
    <p class="mt-1 text-sm text-muted-foreground">@{{ props.username }}</p>
    <p v-if="props.user?.bio" class="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
      {{ props.user.bio }}
    </p>
  </div>
</template>
