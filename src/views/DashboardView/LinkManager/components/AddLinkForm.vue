<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import Button from '@/components/Button/index.vue'
import Input from '@/components/Input/index.vue'
import { useHolinkStore } from '@/stores/holink-store'
import { useToast } from '@/composables/use-toast'
import { detectPlatform } from '@/utils/platform'
import { validateLinkTitle, validateLinkUrl } from '@/utils/validate-link'
import type { Platform } from '@/models'
import { IconLink, IconPlus } from '@tabler/icons-vue'
import PlatformIcon from './PlatformIcon.vue'

const store = useHolinkStore()
const toast = useToast()

const newLink = reactive({
  title: '',
  url: '',
})

const addLinkError = reactive({
  title: '',
  url: '',
})

watch(
  () => newLink.title,
  () => (addLinkError.title = ''),
)

watch(
  () => newLink.url,
  () => (addLinkError.url = ''),
)

const detectedPlatform = computed<Platform>(() => {
  if (newLink.url.trim().length === 0) return 'unknown'
  return detectPlatform(newLink.url)
})

function handleAddLink(): void {
  addLinkError.title = ''
  addLinkError.url = ''

  const titleErr = validateLinkTitle(newLink.title, true)
  const urlErr = validateLinkUrl(newLink.url, true)

  if (titleErr) {
    addLinkError.title = titleErr
  }

  if (urlErr) {
    addLinkError.url = urlErr
  }

  if (titleErr || urlErr) return

  const result = store.addLink(newLink.title.trim(), newLink.url.trim())
  if (result.success) {
    newLink.title = ''
    newLink.url = ''
    toast.success('Link added successfully!')
  } else {
    addLinkError.url = result.error ?? 'Failed to add link'
  }
}
</script>

<template>
  <div class="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
    <h3 class="mb-3 text-sm font-semibold text-foreground">Add New Link</h3>
    <form class="flex flex-col gap-3 sm:flex-row sm:items-start" @submit.prevent="handleAddLink">
      <div class="flex-1">
        <Input
          v-model="newLink.title"
          placeholder="Title (e.g., My Instagram)"
          :error="addLinkError.title"
        />
      </div>
      <div class="flex-1">
        <Input
          v-model="newLink.url"
          placeholder="URL (e.g., instagram.com/me)"
          :error="addLinkError.url"
        >
          <template #prefix>
            <PlatformIcon v-if="detectedPlatform !== 'unknown'" :platform="detectedPlatform" />
            <IconLink v-else :size="16" class="text-muted-foreground" />
          </template>
        </Input>
      </div>
      <Button type="submit">
        <IconPlus :size="16" />
        Add
      </Button>
    </form>
  </div>
</template>
