<script setup lang="ts">
defineOptions({ name: 'DashboardView' })

import { ref } from 'vue'
import { useHolinkStore } from '@/stores/holink-store'
import { IconUser, IconLink } from '@tabler/icons-vue'
import ProfileEditor from './ProfileEditor/index.vue'
import LinkManager from './LinkManager/index.vue'
import Tabs from '@/components/ui/Tabs/index.vue'
import TabsList from '@/components/ui/Tabs/TabsList.vue'
import TabsTrigger from '@/components/ui/Tabs/TabsTrigger.vue'
import TabsContent from '@/components/ui/Tabs/TabsContent.vue'
import ThemeToggle from '@/components/ThemeToggle/index.vue'
import Toast from '@/components/ui/Toast/index.vue'

const store = useHolinkStore()
const activeTab = ref('profile')
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
      <ThemeToggle />
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
