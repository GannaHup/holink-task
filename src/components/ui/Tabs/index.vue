<script setup lang="ts">
defineOptions({ name: 'Tabs' })

import { provide, ref, watch, type Ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    defaultValue?: string
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const internalValue = ref(props.modelValue ?? props.defaultValue ?? '')

const activeTab: Ref<string> = ref('')

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined) {
      internalValue.value = val
      activeTab.value = val
    }
  },
  { immediate: true },
)

watch(internalValue, (val) => {
  activeTab.value = val
  emit('update:modelValue', val)
})

// Initialize
if (props.modelValue !== undefined) {
  activeTab.value = props.modelValue
} else if (props.defaultValue !== undefined) {
  activeTab.value = props.defaultValue
  internalValue.value = props.defaultValue
}

function setActiveTab(value: string) {
  internalValue.value = value
}

provide('tabs-active', activeTab)
provide('tabs-set-active', setActiveTab)
</script>

<template>
  <div>
    <slot />
  </div>
</template>
