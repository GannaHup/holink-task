<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { Platform } from '@/models'
import {
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconWorld,
  IconHelpCircle,
} from '@tabler/icons-vue'

const props = withDefaults(
  defineProps<{
    platform: Platform
    size?: number
    withBackground?: boolean
  }>(),
  {
    size: 16,
    withBackground: false,
  },
)

const platformIconMap: Record<Platform, Component> = {
  instagram: IconBrandInstagram,
  youtube: IconBrandYoutube,
  tiktok: IconBrandTiktok,
  whatsapp: IconBrandWhatsapp,
  marketplace: IconBuildingStore,
  website: IconWorld,
  unknown: IconHelpCircle,
}

const platformColorMap: Record<Platform, string> = {
  instagram: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
  youtube: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  tiktok: 'bg-muted text-foreground dark:bg-zinc-700/50 dark:text-zinc-200',
  whatsapp: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  marketplace: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  website: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  unknown: 'bg-muted text-muted-foreground',
}

const iconComponent = computed(() => platformIconMap[props.platform] ?? IconHelpCircle)

const colors = computed(() => {
  return platformColorMap[props.platform] ?? 'bg-muted text-muted-foreground'
})

const iconClass = computed(() => {
  return colors.value.split(' ').find((c) => c.startsWith('text-')) ?? 'text-muted-foreground'
})

const wrapperClass = computed(() => {
  const bg = colors.value.split(' ').find((c) => c.startsWith('bg-')) ?? 'bg-muted'
  return `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`
})
</script>

<template>
  <div v-if="withBackground" :class="wrapperClass">
    <component :is="iconComponent" :size="size" :class="iconClass" />
  </div>
  <component v-else :is="iconComponent" :size="size" :class="iconClass" />
</template>
