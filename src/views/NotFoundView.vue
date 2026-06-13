<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { IconHome, IconMoodSad, IconSparkles } from '@tabler/icons-vue'
import ThemeToggle from '@/components/ThemeToggle/index.vue'
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-background px-4 dark:from-indigo-500/10"
  >
    <!-- Floating theme toggle -->
    <div class="fixed right-4 top-4 z-50">
      <ThemeToggle />
    </div>

    <div class="text-center">
      <!-- Illustration -->
      <div
        class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/15"
      >
        <IconMoodSad :size="48" class="text-indigo-500 dark:text-indigo-300" />
      </div>

      <!-- Text -->
      <h1 class="text-3xl font-bold text-foreground">Profile Not Found</h1>
      <p class="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        The profile you're looking for doesn't exist or may have been removed. Check the username
        and try again.
      </p>

      <!-- Actions -->
      <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <RouterLink
          to="/dashboard"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <IconHome :size="18" />
          Kembali ke Dashboard
        </RouterLink>
        <RouterLink
          to="/dashboard"
          class="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-background px-5 py-2.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
        >
          <IconSparkles :size="18" />
          Buat HoLink Anda Sendiri
        </RouterLink>
      </div>
    </div>
  </div>
</template>
