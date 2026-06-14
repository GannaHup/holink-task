<script lang="ts" setup>
defineOptions({ name: 'LinkManager' })

import { ref, onUnmounted, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useHolinkStore } from '@/stores/holink-store'
import { useToast } from '@/composables/use-toast.ts'
import { normalizeUrl, detectPlatform } from '@/utils/link'
import { IconArrowBackUp, IconAlertCircle } from '@tabler/icons-vue'
import type { HoLinkItem } from '@/models/index.ts'
import Button from '@/components/Button/index.vue'
import LinkItem from './components/LinkItem.vue'
import SearchBar from './components/SearchBar.vue'
import EmptyState from './components/EmptyState.vue'
import AddLinkForm from './components/AddLinkForm.vue'

const store = useHolinkStore()
const toast = useToast()

// ── Link List Management ─────────────────────────────────────────────────────
const links = ref([...store.filteredLinks])

watch(
  () => store.filteredLinks,
  (newVal) => {
    links.value = [...newVal]
  },
  { deep: true },
)

function onDragEnd() {
  store.updateLinksOrder(links.value)
}

// ── Link Manager: Edit Link ─────────
const editingLinkId = ref<string | null>(null)
const editFormData = ref({ title: '', url: '' })
const editLinkError = ref('')

// ── Link Manager: Undo Delete ─────────
const undoCountdown = ref(0)
let undoInterval: ReturnType<typeof setInterval> | null = null

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

  const normalized = urlResult.normalizedUrl
  const platform = detectPlatform(normalized)

  store.updateLink(editingLinkId.value, {
    title: editFormData.value.title.trim(),
    url: editFormData.value.url.trim(),
    normalizedUrl: normalized,
    platform: platform,
  })

  cancelEditing()
  toast.success('Link updated successfully!')
}

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
</script>

<template>
  <div>
    <AddLinkForm />

    <SearchBar v-model="store.searchQuery" />

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
        class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10"
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
          @click="handleUndoDelete"
        >
          <IconArrowBackUp :size="14" />
          Undo
        </Button>
      </div>
    </Transition>

    <!-- Links List -->
    <div class="space-y-3">
      <VueDraggable
        v-model="links"
        handle=".drag-handle"
        :animation="150"
        :disabled="store.searchQuery.length > 0"
        @end="onDragEnd"
      >
        <div v-for="(link, index) in links" :key="link.id" class="mb-3">
          <LinkItem
            :link="link"
            :index="index"
            :editing-link-id="editingLinkId"
            :edit-form-data="editFormData"
            :edit-link-error="editLinkError"
            :filtered-links-length="links.length"
            @start-editing="startEditing"
            @save-editing="saveEditing"
            @cancel-editing="cancelEditing"
            @handle-delete-link="handleDeleteLink"
            @toggle-link-active="store.toggleLinkActive"
            @move-link="store.moveLink"
            @update:edit-form-data="editFormData = $event"
          />
        </div>
      </VueDraggable>

      <EmptyState v-if="store.filteredLinks.length === 0" :search-query="store.searchQuery" />
    </div>
  </div>
</template>
