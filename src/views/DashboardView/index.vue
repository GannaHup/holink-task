<script setup lang="ts">
defineOptions({ name: 'DashboardView' })

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHolinkStore } from '@/stores/holink-store'
import { IconUser, IconLink, IconLogout } from '@tabler/icons-vue'
import ProfileEditor from './ProfileEditor/index.vue'
import LinkManager from './LinkManager/index.vue'
import Tabs from '@/components/Tabs/index.vue'
import TabsList from '@/components/Tabs/TabsList.vue'
import TabsTrigger from '@/components/Tabs/TabsTrigger.vue'
import TabsContent from '@/components/Tabs/TabsContent.vue'
import ThemeToggle from '@/components/ThemeToggle/index.vue'
import Toast from '@/components/Toast/index.vue'

const router = useRouter()
const store = useHolinkStore()
const activeTab = ref<'profile' | 'links'>('profile')

function handleLogout(): void {
  store.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="max-w-5xl mx-auto py-5">
    <Toast />

    <div class="flex justify-between gap-4">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-foreground">Dashboard</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Welcome back, {{ store.currentUser?.displayName ?? 'User' }}!
        </p>
      </div>
      <div class="flex items-center gap-2">
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
      <TabsList>
        <TabsTrigger value="profile">
          <IconUser :size="18" />
          Profile Editor
        </TabsTrigger>
        <TabsTrigger value="links">
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
