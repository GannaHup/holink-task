<script setup lang="ts">
import { IconBrandVue, IconRocket } from '@tabler/icons-vue'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div>
    <div class="mb-8 text-center">
      <div class="mb-4 flex items-center justify-center">
        <IconBrandVue :size="64" class="text-emerald-500" />
      </div>
      <h2 class="mb-2 text-3xl font-bold text-gray-900">Welcome to Holink</h2>
      <p class="text-gray-600">
        Vue 3 + TypeScript + Pinia + Vue Router + Tailwind CSS + Tabler Icons
      </p>
    </div>

    <div class="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center gap-2">
        <IconRocket :size="24" class="text-blue-500" />
        <h3 class="text-lg font-semibold">Counter Demo (Pinia)</h3>
      </div>
      <p class="mb-4 text-4xl font-bold text-gray-900">{{ counter.count }}</p>
      <div class="flex gap-2">
        <button
          class="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          @click="counter.increment()"
        >
          Increment
        </button>
        <button
          class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          @click="counter.reset()"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>
