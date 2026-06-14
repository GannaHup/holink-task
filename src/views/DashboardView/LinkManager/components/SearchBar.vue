<script setup lang="ts">
import { computed } from 'vue'
import Input from '@/components/Input/index.vue'
import { IconSearch } from '@tabler/icons-vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localSearchQuery = computed<string>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <div class="mb-4">
    <Input v-model="localSearchQuery" placeholder="Search links by title or URL...">
      <template #prefix>
        <IconSearch :size="18" />
      </template>
    </Input>
  </div>
</template>
