<script lang="ts" setup>
defineOptions({ name: 'LinkManager' })

import { ref, onUnmounted, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useHolinkStore } from '@/stores/holink-store'
import { useToast } from '@/composables/use-toast.ts'
import type { HoLinkItem } from '@/models/index.ts'
import LinkItem from './components/LinkItem.vue'
import SearchBar from './components/SearchBar.vue'
import EmptyState from './components/EmptyState.vue'
import AddLinkForm from './components/AddLinkForm.vue'
import { detectPlatform } from '@/utils/platform'
import { normalizeUrl } from '@/utils/validate-url'

const store = useHolinkStore()
const toast = useToast()

const links = ref([...store.filteredLinks])

const editingLinkId = ref<string | null>(null)
const editFormData = ref({ title: '', url: '' })
const editLinkError = ref('')

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
  const platform = detectPlatform(urlResult.normalizedUrl)

  store.updateLink(editingLinkId.value, {
    title: editFormData.value.title.trim(),
    url: editFormData.value.url.trim(),
    normalizedUrl: urlResult.normalizedUrl,
    platform: platform,
  })

  cancelEditing()
  toast.success('Link updated successfully!')
}

function handleDeleteLink(id: string): void {
  store.deleteLink(id)
}

function handleUndoDelete(id: string): void {
  store.undoDelete(id)
  toast.success('Link restored!')
}

function handleConfirmDelete(id: string): void {
  store.confirmDelete(id)
}

onUnmounted(() => {
  // Auto confirm any pending deletes when component unmounts
  for (const id of store.pendingDeleteIds) {
    store.confirmDelete(id)
  }
})
</script>

<template>
  <div>
    <AddLinkForm />

    <SearchBar v-model="store.searchQuery" />

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
            :is-pending-delete="store.isPendingDelete(link.id)"
            @start-editing="startEditing"
            @save-editing="saveEditing"
            @cancel-editing="cancelEditing"
            @handle-delete-link="handleDeleteLink"
            @toggle-link-active="store.toggleLinkActive"
            @move-link="store.moveLink"
            @update:edit-form-data="editFormData = $event"
            @undo-delete="handleUndoDelete"
            @confirm-delete="handleConfirmDelete"
          />
        </div>
      </VueDraggable>

      <EmptyState v-if="store.filteredLinks.length === 0" :search-query="store.searchQuery" />
    </div>
  </div>
</template>
