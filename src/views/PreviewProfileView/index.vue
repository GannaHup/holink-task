<script setup lang="ts">
defineOptions({ name: 'PreviewProfileView' })

import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHolinkStore } from '@/stores/holink-store'
import type { HoLinkItem } from '@/models/index.ts'
import { IconMoodSad, IconArrowLeft } from '@tabler/icons-vue'
import ProfileSkeleton from './components/ProfileSkeleton.vue'
import ProfileHeader from './components/ProfileHeader.vue'
import LinkList from './components/LinkList.vue'

const route = useRoute()
const store = useHolinkStore()

const isLoading = ref(true)

onMounted(() => {
  // Simulate a brief fetch; the inline not-found state renders after this.
  setTimeout(() => {
    isLoading.value = false
  }, 1000)

  // Only count a view when the profile actually exists.
  if (store.findUserByUsername(route.params.username as string)) {
    store.logProfileView()
  }
})

const username = computed(() => route.params.username as string)

// Read the profile from the multi-user registry so public pages render even
// when the viewer is not authenticated.
const user = computed(() => store.findUserByUsername(username.value))

const activeLinks = computed(() => {
  if (!user.value) return []
  return user.value.links.filter((link) => link.isActive).sort((a, b) => a.order - b.order)
})

function handleLinkClick(link: HoLinkItem): void {
  store.logLinkClick(link.id)
  window.open(link.normalizedUrl, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div
    class="flex min-h-screen items-start justify-center bg-linear-to-b from-indigo-50 to-gray-50 px-4 py-12"
  >
    <div class="w-full max-w-md">
      <ProfileSkeleton v-if="isLoading" />

      <template v-else>
        <!-- Inline not-found state: URL stays put, no redirect to "/". -->
        <div v-if="!user" class="py-16 text-center">
          <div
            class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100"
          >
            <IconMoodSad :size="40" class="text-indigo-500" />
          </div>
          <h1 class="text-xl font-bold text-gray-900">Profile Not Found</h1>
          <p class="mx-auto mt-2 max-w-xs text-sm text-gray-500">
            The profile <span class="font-semibold">@{{ username }}</span> doesn't exist.
          </p>
          <a
            href="/login"
            class="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <IconArrowLeft :size="16" />
            Create your own
          </a>
        </div>

        <!-- Existing profile -->
        <template v-else>
          <ProfileHeader :user="user" :username="username" />

          <LinkList :links="activeLinks" @link-click="handleLinkClick" />

          <p class="mt-8 text-center text-xs text-gray-400">
            Powered by <span class="font-semibold text-blue-500">HoLink</span>
          </p>
        </template>
      </template>
    </div>
  </div>
</template>
