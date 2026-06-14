<script setup lang="ts">
import { watch, computed, ref, onUnmounted } from 'vue'
import Button from '@/components/Button/index.vue'
import Input from '@/components/Input/index.vue'
import Switch from '@/components/Switch/index.vue'
import type { HoLinkItem } from '@/models'
import {
  validateLinkTitle,
  validateLinkUrl,
  LINK_TITLE_MAX,
  LINK_URL_MAX,
} from '@/utils/validate-link'
import {
  IconLink,
  IconAlertCircle,
  IconChevronUp,
  IconChevronDown,
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconGripVertical,
  IconArrowBackUp,
} from '@tabler/icons-vue'
import PlatformIcon from './PlatformIcon.vue'

const props = defineProps<{
  link: HoLinkItem
  index: number
  editingLinkId: string | null
  editFormData: { title: string; url: string }
  editLinkError: string
  filteredLinksLength: number
  isPendingDelete: boolean
}>()

const emit = defineEmits<{
  (e: 'startEditing', link: HoLinkItem): void
  (e: 'saveEditing'): void
  (e: 'cancelEditing'): void
  (e: 'handleDeleteLink', id: string): void
  (e: 'toggleLinkActive', id: string): void
  (e: 'moveLink', id: string, direction: 'up' | 'down'): void
  (e: 'update:editFormData', data: { title: string; url: string }): void
  (e: 'undoDelete', id: string): void
  (e: 'confirmDelete', id: string): void
}>()

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

// Validation (both fields required when editing an existing link)
const titleError = computed(() => validateLinkTitle(localEditFormData.value.title, true))
const urlError = computed(() => validateLinkUrl(localEditFormData.value.url, true))
const isEditFormValid = computed(() => titleError.value === '' && urlError.value === '')

function handleTitleUpdate(value: string | number) {
  localEditFormData.value.title = String(value)
  emit('update:editFormData', localEditFormData.value)
}

function handleUrlUpdate(value: string | number) {
  localEditFormData.value.url = String(value)
  emit('update:editFormData', localEditFormData.value)
}

// ── Undo Countdown Logic ────────────────────────────────────────────────────
const undoCountdown = ref(0)
let undoInterval: ReturnType<typeof setInterval> | null = null

watch(
  () => props.isPendingDelete,
  (isPending) => {
    if (isPending) {
      startUndoCountdown()
    } else {
      clearUndoCountdown()
    }
  },
)

function startUndoCountdown(): void {
  clearUndoCountdown()
  undoCountdown.value = 5

  undoInterval = setInterval(() => {
    undoCountdown.value--
    if (undoCountdown.value <= 0) {
      emit('confirmDelete', props.link.id)
      clearUndoCountdown()
    }
  }, 1000)
}

function handleUndo(): void {
  emit('undoDelete', props.link.id)
  clearUndoCountdown()
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
</script>

<template>
  <div class="rounded-lg border border-border bg-card shadow-sm">
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
        v-if="isPendingDelete"
        class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 sm:px-4 sm:py-3 dark:border-amber-500/30 dark:bg-amber-500/10"
      >
        <div class="flex min-w-0 items-center gap-2">
          <IconAlertCircle :size="18" class="shrink-0 text-amber-600 dark:text-amber-400" />
          <span class="text-sm text-amber-800 dark:text-amber-200">
            Link deleted.
            <span class="text-amber-500 dark:text-amber-400">({{ undoCountdown }}s)</span>
          </span>
        </div>
        <Button
          size="sm"
          class="shrink-0 gap-1.5 bg-amber-600 text-white shadow-none hover:bg-amber-700"
          @click="handleUndo"
        >
          <IconArrowBackUp :size="14" />
          Undo
        </Button>
      </div>
    </Transition>

    <!-- Normal View -->
    <div
      v-if="!isCurrentLinkEditing && !isPendingDelete"
      class="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <div
          class="cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing drag-handle"
        >
          <IconGripVertical :size="20" />
        </div>

        <PlatformIcon :platform="link.platform" :size="20" with-background />

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-foreground">{{ link.title }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ link.normalizedUrl }}</p>
        </div>
      </div>

      <div
        class="flex w-full shrink-0 items-center gap-2 border-t border-border pt-3 sm:w-auto sm:justify-start sm:border-0 sm:pt-0"
      >
        <Switch
          :model-value="link.isActive"
          size="lg"
          :aria-label="link.isActive ? 'Deactivate link' : 'Activate link'"
          @update:model-value="emit('toggleLinkActive', link.id)"
        />

        <!-- Move Up -->
        <Button
          variant="ghost"
          class="h-auto w-auto p-2 sm:p-1.5"
          :disabled="index === 0"
          title="Move up"
          :aria-label="`Move ${link.title} up`"
          @click="emit('moveLink', link.id, 'up')"
        >
          <IconChevronUp :size="16" />
        </Button>

        <!-- Move Down -->
        <Button
          variant="ghost"
          class="h-auto w-auto p-2 sm:p-1.5"
          :disabled="index === filteredLinksLength - 1"
          title="Move down"
          :aria-label="`Move ${link.title} down`"
          @click="emit('moveLink', link.id, 'down')"
        >
          <IconChevronDown :size="16" />
        </Button>

        <!-- Edit -->
        <Button
          variant="ghost"
          class="h-auto w-auto shrink-0 p-2 text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 sm:p-1.5 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-300"
          title="Edit link"
          @click="emit('startEditing', link)"
        >
          <IconPencil :size="16" />
        </Button>

        <!-- Delete -->
        <Button
          variant="ghost"
          class="h-auto w-auto shrink-0 p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 sm:p-1.5 dark:hover:bg-red-500/15 dark:hover:text-red-400"
          title="Delete link"
          @click="emit('handleDeleteLink', link.id)"
        >
          <IconTrash :size="16" />
        </Button>
      </div>
    </div>

    <!-- Editing View -->
    <div v-else-if="isCurrentLinkEditing" class="p-3 sm:p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div class="flex-1">
          <Input
            :model-value="localEditFormData.title"
            placeholder="Title"
            :max-length="LINK_TITLE_MAX"
            :error="titleError"
            @update:model-value="handleTitleUpdate"
          />
        </div>
        <div class="flex-1">
          <Input
            :model-value="localEditFormData.url"
            placeholder="URL"
            :max-length="LINK_URL_MAX"
            :error="urlError"
            @update:model-value="handleUrlUpdate"
          >
            <template #prefix>
              <IconLink :size="16" class="text-muted-foreground" />
            </template>
          </Input>
        </div>
        <div class="flex items-center gap-2">
          <Button
            class="flex-1 bg-green-600 text-white shadow-none hover:bg-green-700 sm:flex-none"
            :disabled="!isEditFormValid"
            @click="emit('saveEditing')"
          >
            <IconCheck :size="16" />
            Save
          </Button>
          <Button
            variant="outline"
            class="flex-1 shadow-none sm:flex-none"
            @click="emit('cancelEditing')"
          >
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
