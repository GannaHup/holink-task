<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { IconHome, IconInfoCircle } from '@tabler/icons-vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <header class="border-b border-gray-200 bg-white shadow-sm">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <h1 class="text-xl font-bold text-gray-900">Holink</h1>

        <nav class="flex items-center gap-4">
          <RouterLink
            to="/"
            class="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            active-class="!bg-gray-100 !text-gray-900"
          >
            <IconHome :size="18" />
            Home
          </RouterLink>
          <RouterLink
            to="/about"
            class="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            active-class="!bg-gray-100 !text-gray-900"
          >
            <IconInfoCircle :size="18" />
            About
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>
