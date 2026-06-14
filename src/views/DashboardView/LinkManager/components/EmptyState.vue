<script setup lang="ts">
import { IconLink } from '@tabler/icons-vue'

defineProps<{
  searchQuery: string
}>()
</script>

<template>
  <div class="rounded-lg border-2 border-dashed border-border p-8 text-center">
    <IconLink :size="32" class="mx-auto mb-2 text-muted-foreground/50" />
    <p class="text-sm text-muted-foreground">
      {{ searchQuery ? 'No links match your search.' : 'No links yet. Add your first link above!' }}
    </p>
  </div>
</template>
