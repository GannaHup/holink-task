<script setup lang="ts">
defineOptions({ name: 'LinkList' })

import { type Component } from 'vue'
import type { Platform, HoLinkItem } from '@/models'
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
    instagram: 'bg-pink-100 text-pink-600',
    youtube: 'bg-red-100 text-red-600',
    tiktok: 'bg-gray-100 text-gray-700',
    whatsapp: 'bg-green-100 text-green-600',
    marketplace: 'bg-orange-100 text-orange-600',
    website: 'bg-blue-100 text-blue-600',
    unknown: 'bg-gray-100 text-gray-500',
  }
  return colors[platform] ?? 'bg-gray-100 text-gray-500'
}
</script>

<template>
  <div class="space-y-3">
    <a
      v-for="link in props.links"
      :key="link.id"
      href="#"
      class="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
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
        <span class="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
          {{ link.title }}
        </span>
      </div>
      <IconExternalLink
        :size="16"
        class="text-gray-400 transition-colors group-hover:text-indigo-500"
      />
    </a>

    <div
      v-if="props.links.length === 0"
      class="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center"
    >
      <IconLink :size="32" class="mx-auto mb-2 text-gray-300" />
      <p class="text-sm text-gray-500">No links available yet.</p>
    </div>
  </div>
</template>
