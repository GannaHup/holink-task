<script setup lang="ts">
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-vue'
import { useToast } from '@/composables/use-toast'

const { visible, message, type } = useToast()
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="visible"
      :class="[
        'fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg',
        type === 'success' ? 'bg-green-600' : 'bg-red-600',
      ]"
    >
      <IconCircleCheck v-if="type === 'success'" :size="18" />
      <IconAlertCircle v-else :size="18" />
      {{ message }}
    </div>
  </Transition>
</template>
