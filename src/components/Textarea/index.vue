<script setup lang="ts">
import { computed, useId } from 'vue'
import { IconAlertCircle } from '@tabler/icons-vue'
import { cn } from '@/lib/utils'
import { textareaVariants } from './Textarea.variants'
import type { TextareaProps } from './Textarea.types'

const props = withDefaults(defineProps<TextareaProps>(), {
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const generatedId = useId()
const textareaId = computed(() => (props.label ? generatedId : undefined))

const hasError = computed(() => Boolean(props.error))

const currentLength = computed(() => String(props.modelValue ?? '').length)
const showCounter = computed(() => typeof props.maxLength === 'number')

const isCounterOverLimit = computed(
  () => showCounter.value && currentLength.value > (props.maxLength as number),
)

const onInput = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <label v-if="label" :for="textareaId" class="mb-1.5 block text-sm font-medium text-foreground">
      {{ label }}
      <span v-if="labelHint" class="text-muted-foreground">{{ labelHint }}</span>
    </label>

    <textarea
      :id="textareaId"
      :value="modelValue"
      :rows="Number(rows)"
      :maxlength="maxLength"
      :placeholder="placeholder"
      :class="cn(textareaVariants({ state: hasError ? 'error' : 'default' }), props.class)"
      v-bind="$attrs"
      @input="onInput"
    />

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
