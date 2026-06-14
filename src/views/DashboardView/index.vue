<script setup lang="ts">
defineOptions({ name: 'DashboardView' })

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useAuthStore } from '@/stores/auth-store'
import { useHolinkStore } from '@/stores/holink-store'
import { IconUser, IconLink, IconLogout } from '@tabler/icons-vue'
import ProfileEditor from './ProfileEditor/index.vue'
import LinkManager from './LinkManager/index.vue'
import Tabs from '@/components/Tabs/index.vue'
import TabsList from '@/components/Tabs/TabsList.vue'
import TabsTrigger from '@/components/Tabs/TabsTrigger.vue'
import TabsContent from '@/components/Tabs/TabsContent.vue'
import ThemeToggle from '@/components/ThemeToggle/index.vue'

useHead({ title: 'Dashboard — HoLink' })

const router = useRouter()
const auth = useAuthStore()
const holink = useHolinkStore()
const activeTab = ref<'profile' | 'links'>('profile')

function handleLogout(): void {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
    <div class="flex justify-between gap-4">
      <div class="mb-6 min-w-0">
        <h1 class="text-xl font-bold text-foreground sm:text-2xl">Dashboard</h1>
        <p class="mt-1 truncate text-sm text-muted-foreground">
          Welcome back, {{ holink.currentUser?.displayName ?? 'User' }}!
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Log out"
          @click="handleLogout"
        >
          <IconLogout :size="16" />
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>

    <Tabs v-model="activeTab" default-value="profile">
      <TabsList class="w-full">
        <TabsTrigger value="profile" class="flex-1 justify-center px-3 sm:flex-none sm:px-4">
          <IconUser :size="18" />
          Profile Editor
        </TabsTrigger>
        <TabsTrigger value="links" class="flex-1 justify-center px-3 sm:flex-none sm:px-4">
          <IconLink :size="18" />
          Link Manager
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileEditor />
      </TabsContent>

      <TabsContent value="links">
        <LinkManager />
      </TabsContent>
    </Tabs>
  </div>
</template>
