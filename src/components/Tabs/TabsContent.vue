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
</script>

<template>
  <div v-if="activeTab === value" :class="cn(props.class)">
    <slot />
  </div>
</template>
