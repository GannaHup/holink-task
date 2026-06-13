<script setup lang="ts">
import { computed, useId, useSlots } from 'vue'
import { IconAlertCircle } from '@tabler/icons-vue'
import { cn } from '@/lib/utils'
import { inputVariants } from './Input.variants'
import type { InputProps } from './Input.types'

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const slots = useSlots()

const generatedId = useId()
const inputId = computed(() => (props.label ? generatedId : undefined))

const hasError = computed(() => !!props.error && props.error.length > 0)
const hasPrefix = computed(() => !!props.prefix || !!slots.prefix)

const inputClasses = computed(() =>
  cn(
    inputVariants({ state: hasError.value ? 'error' : 'default', hasPrefix: hasPrefix.value }),
    props.multiline ? 'resize-none' : '',
    props.class,
  ),
)

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <label v-if="label" :for="inputId" class="mb-1.5 block text-sm font-medium text-foreground">
      {{ label }}
      <span v-if="labelHint" class="text-muted-foreground">{{ labelHint }}</span>
    </label>

    <div class="relative">
      <span
        v-if="prefix"
        class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground"
      >
        {{ prefix }}
      </span>
      <span
        v-else-if="$slots.prefix"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground"
      >
        <slot name="prefix" />
      </span>

      <textarea
        v-if="multiline"
        :id="inputId"
        :value="modelValue"
        :rows="Number(rows)"
        :placeholder="placeholder"
        :class="inputClasses"
        v-bind="$attrs"
        @input="onInput"
      />

      <input
        v-else
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :class="inputClasses"
        v-bind="$attrs"
        @input="onInput"
      />
    </div>

    <div v-if="hasError || $slots.hint" class="mt-1.5 flex items-center justify-between">
      <p v-if="hasError" class="flex items-center gap-1 text-xs text-destructive">
        <IconAlertCircle :size="14" />
        {{ error }}
      </p>
      <span v-else />
      <slot name="hint" />
    </div>
  </div>
</template>
