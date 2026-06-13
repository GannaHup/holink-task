<script setup lang="ts">
import { RouterView } from 'vue-router'
import Toast from '@/components/ui/Toast/index.vue'
import { useThemeStore } from '@/stores/theme-store'

// Initialize theme store early so the .dark class and system listener
// are applied regardless of which view renders.
useThemeStore()
</script>

<template>
  <RouterView />
  <Toast />
</template>
