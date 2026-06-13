<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    value: string
    class?: string
  }>(),
  {
    class: '',
  },
)

const activeTab = inject<Ref<string>>('tabs-active')
const setActiveTab = inject<(value: string) => void>('tabs-set-active')
</script>

<template>
  <button
    :class="
      cn(
        'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer',
        activeTab === value
          ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
          : 'border-transparent text-muted-foreground hover:text-foreground',
        props.class,
      )
    "
    @click="setActiveTab?.(value)"
  >
    <slot />
  </button>
</template>
