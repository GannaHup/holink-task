<script setup lang="ts">
import { computed, useId, useSlots } from 'vue'
import { IconAlertCircle } from '@tabler/icons-vue'
import { cn } from '@/lib/utils'
import { inputVariants } from './Input.variants'
import type { InputProps } from './Input.types'

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const slots = useSlots()

const generatedId = useId()
const inputId = computed(() => (props.label ? generatedId : undefined))

const hasError = computed(() => !!props.error && props.error.length > 0)

const currentLength = computed(() => String(props.modelValue ?? '').length)
const showCounter = computed(() => typeof props.maxLength === 'number')
const isCounterOverLimit = computed(
  () => showCounter.value && currentLength.value > (props.maxLength as number),
)

const inputClasses = computed(() =>
  cn(
    inputVariants({
      state: hasError.value ? 'error' : 'default',
      hasPrefix: !!props.prefix || !!slots.prefix,
    }),
    props.class,
  ),
)

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
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

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :maxlength="maxLength"
        :placeholder="placeholder"
        :class="inputClasses"
        v-bind="$attrs"
        @input="onInput"
      />
    </div>

    <div
      v-if="hasError || $slots.hint || showCounter"
      class="mt-1.5 flex items-center justify-between"
    >
      <p v-if="hasError" class="flex items-center gap-1 text-xs text-destructive">
        <IconAlertCircle :size="14" />
        {{ error }}
      </p>
      <span v-else />
      <slot name="hint">
        <span
          v-if="showCounter"
          :class="[
            'text-xs',
            isCounterOverLimit ? 'font-medium text-destructive' : 'text-muted-foreground',
          ]"
        >
          {{ currentLength }}/{{ maxLength }}
        </span>
      </slot>
    </div>
  </div>
</template>
