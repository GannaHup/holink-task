<script setup lang="ts">
defineOptions({ name: 'ThemeToggle' })

import { computed } from 'vue'
import { IconSun, IconMoon } from '@tabler/icons-vue'
import { useThemeStore } from '@/stores/theme-store'

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)
</script>

<template>
  <button
    type="button"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    class="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    @click="themeStore.toggle()"
  >
    <IconSun v-if="isDark" :size="18" class="text-amber-500" />
    <IconMoon v-else :size="18" class="text-indigo-600" />
  </button>
</template>
