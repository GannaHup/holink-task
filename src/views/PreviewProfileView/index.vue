<script setup lang="ts">
defineOptions({ name: 'PreviewProfileView' })

import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHolinkStore } from '@/stores/holink-store'
import type { HoLinkItem } from '@/types'
import ProfileSkeleton from './components/ProfileSkeleton.vue'
import ProfileHeader from './components/ProfileHeader.vue'
import LinkList from './components/LinkList.vue'

const route = useRoute()
const store = useHolinkStore()

// ── Loading State (Skeleton) ────────────────────────────────────────────────
const isLoading = ref(true)

onMounted(() => {
  // Simulate skeleton loading for 1 second
  setTimeout(() => {
    isLoading.value = false
  }, 1000)

  // Log profile view analytics
  store.logProfileView()
})

// ── User Data ───────────────────────────────────────────────────────────────
const username = computed(() => route.params.username as string)

const user = computed(() => {
  if (store.currentUser?.username === username.value) {
    return store.currentUser
  }
  return null
})

const activeLinks = computed(() => {
  if (!user.value) return []
  return user.value.links.filter((link) => link.isActive).sort((a, b) => a.order - b.order)
})

// ── Link Click Handler (Analytics) ──────────────────────────────────────────
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
        <ProfileHeader :user="user" :username="username" />

        <!-- Links -->
        <LinkList :links="activeLinks" @link-click="handleLinkClick" />

        <p class="mt-8 text-center text-xs text-gray-400">
          Powered by <span class="font-semibold text-blue-500">HoLink</span>
        </p>
      </template>
    </div>
  </div>
</template>
