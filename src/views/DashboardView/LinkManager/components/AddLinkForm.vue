<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import Button from '@/components/Button/index.vue'
import Input from '@/components/Input/index.vue'
import { useHolinkStore } from '@/stores/holink-store'
import { useToast } from '@/composables/use-toast'
import { detectPlatform } from '@/utils/link'
import type { Platform } from '@/models'
import {
  IconLink,
  IconPlus,
  IconAlertCircle,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconWorld,
  IconHelpCircle,
} from '@tabler/icons-vue'

const store = useHolinkStore()
const toast = useToast()

const newLinkTitle = ref('')
const newLinkUrl = ref('')
const addLinkError = ref('')

const detectedPlatform = computed<Platform>(() => {
  if (newLinkUrl.value.trim().length === 0) return 'unknown'
  return detectPlatform(newLinkUrl.value)
})

function getPlatformIcon(platform: Platform) {
  const platformIconMap: Record<Platform, Component> = {
    instagram: IconBrandInstagram,
    youtube: IconBrandYoutube,
    tiktok: IconBrandTiktok,
    whatsapp: IconBrandWhatsapp,
    marketplace: IconBuildingStore,
    website: IconWorld,
    unknown: IconHelpCircle,
  }
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

function handleAddLink(): void {
  addLinkError.value = ''

  if (!newLinkTitle.value.trim()) {
    addLinkError.value = 'Title is required'
    return
  }

  const result = store.addLink(newLinkTitle.value.trim(), newLinkUrl.value.trim())
  if (result.success) {
    newLinkTitle.value = ''
    newLinkUrl.value = ''
    toast.success('Link added successfully!')
  } else {
    addLinkError.value = result.error ?? 'Failed to add link'
  }
}
</script>

<template>
  <div class="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
    <h3 class="mb-3 text-sm font-semibold text-foreground">Add New Link</h3>
    <form class="flex flex-col gap-3 sm:flex-row sm:items-start" @submit.prevent="handleAddLink">
      <div class="flex-1">
        <Input v-model="newLinkTitle" placeholder="Title (e.g., My Instagram)" />
      </div>
      <div class="flex-1">
        <Input v-model="newLinkUrl" placeholder="URL (e.g., instagram.com/me)">
          <template #prefix>
            <component
              :is="getPlatformIcon(detectedPlatform)"
              v-if="detectedPlatform !== 'unknown'"
              :size="16"
              :class="
                getPlatformColor(detectedPlatform)
                  .split(' ')
                  .find((c) => c.startsWith('text-'))
                  ?.replace('text-', 'text-') ?? 'text-muted-foreground'
              "
            />
            <IconLink v-else :size="16" class="text-muted-foreground" />
          </template>
        </Input>
      </div>
      <Button type="submit">
        <IconPlus :size="16" />
        Add
      </Button>
    </form>
    <p v-if="addLinkError" class="mt-2 flex items-center gap-1 text-xs text-destructive">
      <IconAlertCircle :size="14" />
      {{ addLinkError }}
    </p>
  </div>
</template>
