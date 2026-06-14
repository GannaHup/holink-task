<script setup lang="ts">
import { cn } from '@/libs/utils'

const props = withDefaults(
  defineProps<{
    class?: string
  }>(),
  {
    class: '',
  },
)
</script>

<template>
  <div :class="cn('mb-6 flex border-b border-border', props.class)">
    <slot />
  </div>
</template>
