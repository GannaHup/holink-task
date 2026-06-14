<script setup lang="ts">
defineOptions({ name: 'AppModal' })

import { watch, onUnmounted } from 'vue'
import { IconX } from '@tabler/icons-vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
  }>(),
  {
    title: '',
    description: '',
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

function close(): void {
  emit('close')
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  },
)

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
          enter-to-class="translate-y-0 opacity-100 sm:scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100 sm:scale-100"
          leave-to-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="open"
            role="dialog"
            aria-modal="true"
            class="w-full max-w-lg rounded-t-xl border border-border bg-card shadow-lg sm:rounded-xl"
          >
            <!-- Header -->
            <div
              v-if="title || description || $slots.header"
              class="flex items-start justify-between gap-4 p-5 sm:p-6"
            >
              <div class="min-w-0 flex-1">
                <slot name="header">
                  <h2 v-if="title" class="text-lg font-semibold text-foreground">{{ title }}</h2>
                  <p v-if="description" class="mt-1 text-sm text-muted-foreground">
                    {{ description }}
                  </p>
                </slot>
              </div>
              <button
                type="button"
                class="-mr-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close"
                @click="close"
              >
                <IconX :size="20" />
              </button>
            </div>

            <!-- Body -->
            <div v-if="$slots.default" class="px-5 pb-2 sm:px-6">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="p-5 sm:p-6">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
