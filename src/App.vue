<script setup lang="ts">
import { RouterView } from 'vue-router'
import Toast from '@/components/Toast/index.vue'
import { useThemeStore } from '@/stores/theme-store'
import { useAuthStore } from '@/stores/auth-store'

useThemeStore()
useAuthStore()
</script>

<template>
  <RouterView />
  <Toast />
</template>
