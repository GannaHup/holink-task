<script setup lang="ts">
defineOptions({ name: 'ProfileSkeleton' })
</script>

<template>
  <!-- Avatar skeleton -->
  <div class="mb-8 text-center">
    <div class="mx-auto mb-4 h-24 w-24 animate-pulse rounded-full bg-muted" />
    <div class="mx-auto h-6 w-40 animate-pulse rounded bg-muted" />
    <div class="mx-auto mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
    <div class="mx-auto mt-3 h-4 w-56 animate-pulse rounded bg-muted" />
  </div>

  <!-- Link skeletons -->
  <div class="space-y-3">
    <div
      v-for="i in 3"
      :key="i"
      class="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div class="h-9 w-9 animate-pulse rounded-lg bg-muted" />
      <div class="flex-1">
        <div class="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
      <div class="h-4 w-4 animate-pulse rounded bg-muted" />
    </div>
  </div>
</template>
