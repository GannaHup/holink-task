<script lang="ts" setup>
defineOptions({ name: 'LinkManager' })

import { ref, computed, onUnmounted, type Component } from 'vue'
import Button from '@/components/ui/Button/index.vue'
import Input from '@/components/ui/Input/index.vue'
import Switch from '@/components/ui/Switch/index.vue'
import { useHolinkStore } from '@/stores/holink-store'
import { useToast } from '@/composables/useToast'
import { normalizeUrl, detectPlatform } from '@/utils/link'
import type { Platform, HoLinkItem } from '@/types'
import {
  IconLink,
  IconPlus,
  IconAlertCircle,
  IconSearch,
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
  IconArrowBackUp,
} from '@tabler/icons-vue'

const store = useHolinkStore()
const toast = useToast()

// ── Link Manager: Add Link ───────────────────────────────────────────────────
const newLinkTitle = ref('')
const newLinkUrl = ref('')
const addLinkError = ref('')

const detectedPlatform = computed<Platform>(() => {
  if (newLinkUrl.value.trim().length === 0) return 'unknown'
  return detectPlatform(newLinkUrl.value)
})

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

// ── Link Manager: Edit Link ──────────────────────────────────────────────────
const editingLinkId = ref<string | null>(null)
const editFormData = ref({ title: '', url: '' })
const editLinkError = ref('')

function startEditing(link: HoLinkItem): void {
  editingLinkId.value = link.id
  editFormData.value = { title: link.title, url: link.url }
  editLinkError.value = ''
}

function cancelEditing(): void {
  editingLinkId.value = null
  editFormData.value = { title: '', url: '' }
  editLinkError.value = ''
}

function saveEditing(): void {
  if (!editingLinkId.value) return
  editLinkError.value = ''

  if (!editFormData.value.title.trim()) {
    editLinkError.value = 'Title is required'
    return
  }

  const urlResult = normalizeUrl(editFormData.value.url.trim())
  if (!urlResult.isValid) {
    editLinkError.value = urlResult.error ?? 'Invalid URL'
    return
  }

  store.updateLink(editingLinkId.value, {
    title: editFormData.value.title.trim(),
    url: editFormData.value.url.trim(),
    normalizedUrl: urlResult.normalizedUrl,
    platform: detectPlatform(urlResult.normalizedUrl),
  })

  cancelEditing()
  toast.success('Link updated successfully!')
}

// ── Link Manager: Undo Delete ────────────────────────────────────────────────
const undoCountdown = ref(0)
let undoInterval: ReturnType<typeof setInterval> | null = null

function handleDeleteLink(id: string): void {
  store.deleteLink(id)
  startUndoCountdown()
}

function startUndoCountdown(): void {
  clearUndoCountdown()
  undoCountdown.value = 5

  undoInterval = setInterval(() => {
    undoCountdown.value--
    if (undoCountdown.value <= 0) {
      store.confirmDelete()
      clearUndoCountdown()
    }
  }, 1000)
}

function handleUndoDelete(): void {
  store.undoDelete()
  clearUndoCountdown()
  toast.success('Link restored!')
}

function clearUndoCountdown(): void {
  if (undoInterval) {
    clearInterval(undoInterval)
    undoInterval = null
  }
  undoCountdown.value = 0
}

onUnmounted(() => {
  clearUndoCountdown()
})

// ── Link Manager: Platform Helpers ───────────────────────────────────────────

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
  <div>
    <!-- Add Link Form -->
    <div class="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 class="mb-3 text-sm font-semibold text-foreground">Add New Link</h3>
      <form class="flex flex-col gap-3 sm:flex-row sm:items-start" @submit.prevent="handleAddLink">
        <div class="flex-1">
          <Input
            :model-value="newLinkTitle"
            placeholder="Title (e.g., My Instagram)"
            @update:model-value="newLinkTitle = String($event)"
          />
        </div>
        <div class="flex-1">
          <Input
            :model-value="newLinkUrl"
            placeholder="URL (e.g., instagram.com/me)"
            @update:model-value="newLinkUrl = String($event)"
          >
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

    <!-- Search Bar -->
    <div class="mb-4">
      <Input
        :model-value="store.searchQuery"
        placeholder="Search links by title or URL..."
        @update:model-value="store.searchQuery = String($event)"
      >
        <template #prefix>
          <IconSearch :size="18" />
        </template>
      </Input>
    </div>

    <!-- Undo Delete Banner -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="store.hasUndoableDelete"
        class="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10"
      >
        <div class="flex items-center gap-2">
          <IconAlertCircle :size="18" class="text-amber-600 dark:text-amber-400" />
          <span class="text-sm text-amber-800 dark:text-amber-200">
            Link deleted.
            <span class="text-amber-500 dark:text-amber-400">({{ undoCountdown }}s)</span>
          </span>
        </div>
        <Button
          size="sm"
          class="gap-1.5 bg-amber-600 text-white shadow-none hover:bg-amber-700"
          aria-label="Undo delete"
          @click="handleUndoDelete"
        >
          <IconArrowBackUp :size="14" />
          Undo
        </Button>
      </div>
    </Transition>

    <!-- Links List -->
    <div class="space-y-3">
      <div
        v-for="(link, index) in store.filteredLinks"
        :key="link.id"
        class="rounded-lg border border-border bg-card shadow-sm"
      >
        <!-- Normal View -->
        <div
          v-if="editingLinkId !== link.id"
          class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <!-- Left: Platform icon + Info -->
          <div class="flex min-w-0 flex-1 items-center gap-3">
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
              @update:model-value="store.toggleLinkActive(link.id)"
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
              @click="store.moveLink(link.id, 'up')"
            >
              <IconChevronUp :size="16" />
            </button>

            <!-- Move Down -->
            <button
              :disabled="index === store.filteredLinks.length - 1"
              :class="[
                'rounded-md p-1.5 transition-colors',
                index === store.filteredLinks.length - 1
                  ? 'cursor-not-allowed text-muted-foreground/40'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ]"
              title="Move down"
              :aria-label="`Move ${link.title} down`"
              @click="store.moveLink(link.id, 'down')"
            >
              <IconChevronDown :size="16" />
            </button>

            <!-- Edit -->
            <Button
              variant="ghost"
              class="h-auto w-auto shrink-0 p-1.5 text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-300"
              title="Edit link"
              @click="startEditing(link)"
            >
              <IconPencil :size="16" />
            </Button>

            <!-- Delete -->
            <Button
              variant="ghost"
              class="h-auto w-auto shrink-0 p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
              title="Delete link"
              @click="handleDeleteLink(link.id)"
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
                :model-value="editFormData.title"
                placeholder="Title"
                @update:model-value="editFormData.title = String($event)"
              />
            </div>
            <div class="flex-1">
              <Input
                :model-value="editFormData.url"
                placeholder="URL"
                @update:model-value="editFormData.url = String($event)"
              />
            </div>
            <div class="flex items-center gap-2">
              <Button
                class="bg-green-600 text-white shadow-none hover:bg-green-700"
                @click="saveEditing"
              >
                <IconCheck :size="16" />
                Save
              </Button>
              <Button variant="outline" class="shadow-none" @click="cancelEditing">
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

      <!-- Empty State -->
      <div
        v-if="store.filteredLinks.length === 0"
        class="rounded-lg border-2 border-dashed border-border p-8 text-center"
      >
        <IconLink :size="32" class="mx-auto mb-2 text-muted-foreground/50" />
        <p class="text-sm text-muted-foreground">
          {{
            store.searchQuery
              ? 'No links match your search.'
              : 'No links yet. Add your first link above!'
          }}
        </p>
      </div>
    </div>
  </div>
</template>
