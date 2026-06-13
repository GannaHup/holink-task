<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { IconLayoutDashboard, IconExternalLink } from '@tabler/icons-vue'
import ThemeToggle from '@/components/ThemeToggle/index.vue'

const route = useRoute()

const isDashboard = computed(() => route.name === 'dashboard')

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { to: '/preview', label: 'Preview', icon: IconExternalLink },
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Desktop Sidebar -->
    <aside
      v-if="isDashboard"
      class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card md:block"
    >
      <div class="flex h-full flex-col">
        <div class="flex h-16 items-center justify-between gap-2 border-b border-border px-6">
          <span class="text-xl font-bold text-indigo-600 dark:text-indigo-400">HoLink</span>
          <ThemeToggle />
        </div>

        <nav class="flex-1 space-y-1 px-3 py-4">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
            active-class="bg-indigo-50 !text-indigo-700 dark:bg-indigo-500/10 dark:!text-indigo-300"
          >
            <component :is="item.icon" :size="20" />
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </aside>

    <main
      :class="[
        'mx-auto min-h-screen w-full px-4 py-6 sm:px-6 lg:px-8',
        isDashboard ? 'md:ml-64' : '',
      ]"
    >
      <!-- Mobile top bar (visible on small screens) -->
      <div v-if="isDashboard" class="mb-4 flex items-center justify-between md:hidden">
        <span class="text-xl font-bold text-indigo-600 dark:text-indigo-400">HoLink</span>
        <ThemeToggle />
      </div>

      <div class="mx-auto max-w-3xl">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Nav -->
    <nav
      v-if="isDashboard"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card md:hidden"
    >
      <div class="flex items-center justify-around py-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          active-class="!text-indigo-600 dark:!text-indigo-400"
        >
          <component :is="item.icon" :size="22" />
          {{ item.label }}
        </RouterLink>
      </div>
    </nav>
  </div>
</template>
