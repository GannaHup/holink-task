<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { switchVariants, switchThumbVariants } from './Switch.variants'
import type { SwitchProps } from './Switch.types'

const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: false,
  size: 'default',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const rootClasses = computed(() => cn(switchVariants({ size: props.size }), props.class))

const thumbClasses = computed(() => cn(switchThumbVariants({ size: props.size })))

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    toggle()
  }
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :data-state="modelValue ? 'checked' : 'unchecked'"
    :disabled="disabled"
    :class="rootClasses"
    @click="toggle"
    @keydown="onKeydown"
  >
    <span :data-state="modelValue ? 'checked' : 'unchecked'" :class="thumbClasses" />
  </button>
</template>
