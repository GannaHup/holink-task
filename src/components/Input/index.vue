<script setup lang="ts">
defineOptions({ name: 'BaseInput' })

import { computed, ref, useId, useSlots } from 'vue'
import { IconAlertCircle, IconEye, IconEyeOff } from '@tabler/icons-vue'
import { cn } from '@/libs/utils'
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

const isPasswordField = computed(() => props.type === 'password')
const isPasswordVisible = ref(false)

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const currentInputType = computed(() => {
  if (isPasswordField.value) {
    return isPasswordVisible.value ? 'text' : 'password'
  }
  return props.type
})

const inputClasses = computed(() =>
  cn(
    inputVariants({
      state: hasError.value ? 'error' : 'default',
      hasPrefix: !!props.prefix || !!slots.prefix,
    }),
    isPasswordField.value && 'pr-10',
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
        :type="currentInputType"
        :value="modelValue"
        :maxlength="maxLength"
        :placeholder="placeholder"
        :class="inputClasses"
        v-bind="$attrs"
        @input="onInput"
      />

      <button
        v-if="isPasswordField"
        type="button"
        class="absolute cursor-pointer inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-hidden"
        @click="togglePasswordVisibility"
      >
        <IconEye v-if="isPasswordVisible" :size="18" />
        <IconEyeOff v-else :size="18" />
      </button>
    </div>

    <div v-if="hasError || $slots.hint || showCounter" class="mt-1.5 flex justify-between gap-1">
      <div v-if="hasError" class="flex gap-1.5 text-xs text-destructive">
        <div>
          <IconAlertCircle :size="16" />
        </div>
        {{ error }}
      </div>
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
