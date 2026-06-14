<script setup lang="ts">
import { watch, computed, ref, type Component } from 'vue'
import Button from '@/components/Button/index.vue'
import Input from '@/components/Input/index.vue'
import Switch from '@/components/Switch/index.vue'
import type { Platform, HoLinkItem } from '@/models'
import {
  IconLink,
  IconAlertCircle,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconWorld,
  IconHelpCircle,
  IconChevronUp,
  IconChevronDown,
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconGripVertical,
} from '@tabler/icons-vue'

const props = defineProps<{
  link: HoLinkItem
  index: number
  editingLinkId: string | null
  editFormData: { title: string; url: string }
  editLinkError: string
  filteredLinksLength: number
}>()

const emit = defineEmits<{
  (e: 'startEditing', link: HoLinkItem): void
  (e: 'saveEditing'): void
  (e: 'cancelEditing'): void
  (e: 'handleDeleteLink', id: string): void
  (e: 'toggleLinkActive', id: string): void
  (e: 'moveLink', id: string, direction: 'up' | 'down'): void
  (e: 'update:editFormData', data: { title: string; url: string }): void
}>()

// ── Platform Helpers ──────────────────────────────────────────────────────────
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

// ── Editing Logic ─────────────────────────────────────────────────────────────
const localEditFormData = ref({ ...props.editFormData })

watch(
  () => props.editFormData,
  (newValue) => {
    localEditFormData.value = { ...newValue }
  },
  { deep: true },
)

const isCurrentLinkEditing = computed(() => props.editingLinkId === props.link.id)

function handleTitleUpdate(value: string | number) {
  localEditFormData.value.title = String(value)
  emit('update:editFormData', localEditFormData.value)
}

function handleUrlUpdate(value: string | number) {
  localEditFormData.value.url = String(value)
  emit('update:editFormData', localEditFormData.value)
}
</script>

<template>
  <div class="rounded-lg border border-border bg-card shadow-sm">
    <!-- Normal View -->
    <div
      v-if="!isCurrentLinkEditing"
      class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <!-- Left: Platform icon + Info -->
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <!-- Drag Handle -->
        <div
          class="cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing drag-handle"
        >
          <IconGripVertical :size="20" />
        </div>

        <div
          :class="[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            getPlatformColor(link.platform),
          ]"
        >
          <component :is="getPlatformIcon(link.platform)" :size="20" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-foreground">{{ link.title }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ link.normalizedUrl }}</p>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex shrink-0 items-center gap-2">
        <!-- Toggle Active -->
        <Switch
          :model-value="link.isActive"
          size="lg"
          :aria-label="link.isActive ? 'Deactivate link' : 'Activate link'"
          @update:model-value="emit('toggleLinkActive', link.id)"
        />

        <!-- Move Up -->
        <button
          :disabled="index === 0"
          :class="[
            'rounded-md p-1.5 transition-colors',
            index === 0
              ? 'cursor-not-allowed text-muted-foreground/40'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          ]"
          title="Move up"
          :aria-label="`Move ${link.title} up`"
          @click="emit('moveLink', link.id, 'up')"
        >
          <IconChevronUp :size="16" />
        </button>

        <!-- Move Down -->
        <button
          :disabled="index === filteredLinksLength - 1"
          :class="[
            'rounded-md p-1.5 transition-colors',
            index === filteredLinksLength - 1
              ? 'cursor-not-allowed text-muted-foreground/40'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          ]"
          title="Move down"
          :aria-label="`Move ${link.title} down`"
          @click="emit('moveLink', link.id, 'down')"
        >
          <IconChevronDown :size="16" />
        </button>

        <!-- Edit -->
        <Button
          variant="ghost"
          class="h-auto w-auto shrink-0 p-1.5 text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-300"
          title="Edit link"
          @click="emit('startEditing', link)"
        >
          <IconPencil :size="16" />
        </Button>

        <!-- Delete -->
        <Button
          variant="ghost"
          class="h-auto w-auto shrink-0 p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
          title="Delete link"
          @click="emit('handleDeleteLink', link.id)"
        >
          <IconTrash :size="16" />
        </Button>
      </div>
    </div>

    <!-- Editing View -->
    <div v-else class="p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div class="flex-1">
          <Input
            :model-value="localEditFormData.title"
            placeholder="Title"
            @update:model-value="handleTitleUpdate"
          />
        </div>
        <div class="flex-1">
          <Input
            :model-value="localEditFormData.url"
            placeholder="URL"
            @update:model-value="handleUrlUpdate"
          >
            <template #prefix>
              <IconLink :size="16" class="text-muted-foreground" />
            </template>
          </Input>
        </div>
        <div class="flex items-center gap-2">
          <Button
            class="bg-green-600 text-white shadow-none hover:bg-green-700"
            @click="emit('saveEditing')"
          >
            <IconCheck :size="16" />
            Save
          </Button>
          <Button variant="outline" class="shadow-none" @click="emit('cancelEditing')">
            <IconX :size="16" />
            Cancel
          </Button>
        </div>
      </div>
      <p v-if="editLinkError" class="mt-2 flex items-center gap-1 text-xs text-destructive">
        <IconAlertCircle :size="14" />
        {{ editLinkError }}
      </p>
    </div>
  </div>
</template>
