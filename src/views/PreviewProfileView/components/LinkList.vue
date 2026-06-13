<script setup lang="ts">
defineOptions({ name: 'LinkList' })

import { type Component } from 'vue'
import type { Platform, HoLinkItem } from '@/types'
import {
  IconLink,
  IconExternalLink,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconWorld,
  IconHelpCircle,
} from '@tabler/icons-vue'

const props = defineProps<{
  links: HoLinkItem[]
}>()

const emit = defineEmits<{
  'link-click': [link: HoLinkItem]
}>()

const platformIconMap: Record<Platform, Component> = {
  instagram: IconBrandInstagram,
  youtube: IconBrandYoutube,
  tiktok: IconBrandTiktok,
  whatsapp: IconBrandWhatsapp,
  marketplace: IconBuildingStore,
  website: IconWorld,
  unknown: IconHelpCircle,
}

function getPlatformIcon(platform: Platform) {
  return platformIconMap[platform] ?? IconHelpCircle
}

function getPlatformColor(platform: Platform): string {
  const colors: Record<Platform, string> = {
    instagram: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
    youtube: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
    tiktok: 'bg-muted text-foreground dark:bg-zinc-700/50 dark:text-zinc-200',
    whatsapp: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400',
    marketplace: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    website: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    unknown: 'bg-muted text-muted-foreground',
  }
  return colors[platform] ?? 'bg-muted text-muted-foreground'
}
</script>

<template>
  <div class="space-y-3">
    <a
      v-for="link in props.links"
      :key="link.id"
      href="#"
      class="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-500/40"
      @click.prevent="emit('link-click', link)"
    >
      <div class="flex items-center gap-3">
        <div
          :class="[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            getPlatformColor(link.platform),
          ]"
        >
          <component :is="getPlatformIcon(link.platform)" :size="20" />
        </div>
        <span
          class="text-sm font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
        >
          {{ link.title }}
        </span>
      </div>
      <IconExternalLink
        :size="16"
        class="text-muted-foreground transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-300"
      />
    </a>

    <div
      v-if="props.links.length === 0"
      class="rounded-xl border-2 border-dashed border-border p-8 text-center"
    >
      <IconLink :size="32" class="mx-auto mb-2 text-muted-foreground/50" />
      <p class="text-sm text-muted-foreground">No links available yet.</p>
    </div>
  </div>
</template>
