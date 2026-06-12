<script setup lang="ts">
import { IconInfoCircle } from '@tabler/icons-vue'
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <IconInfoCircle :size="32" class="text-blue-500" />
      <h2 class="text-2xl font-bold text-gray-900">About</h2>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 class="mb-4 text-lg font-semibold">Tech Stack</h3>
      <ul class="space-y-2 text-gray-600">
        <li class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Vue 3 with Composition API
        </li>
        <li class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          TypeScript
        </li>
        <li class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
          Pinia (State Management)
        </li>
        <li class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
          Vue Router
        </li>
        <li class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
          Tailwind CSS v4
        </li>
        <li class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
          Tabler Icons
        </li>
        <li class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
          Vite
        </li>
      </ul>

      <div class="mt-6 rounded-md bg-gray-50 p-4">
        <p class="text-sm text-gray-500">
          This project was scaffolded with <strong>create-vue</strong> and uses
          <strong>Bun</strong> as the package manager. Linting is handled by
          <strong>ESLint</strong> + <strong>OxLint</strong>, formatting by
          <strong>Prettier</strong>, and git hooks by <strong>Lefthook</strong> +
          <strong>lint-staged</strong>.
        </p>
      </div>
    </div>
  </div>
</template>
