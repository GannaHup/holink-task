import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import analyzer from 'vite-bundle-analyzer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), vueDevTools(), tailwindcss(), mode === 'analyze' && analyzer()].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('vue-draggable-plus') ||
            id.includes('sortablejs') ||
            id.includes('@types/sortablejs')
          ) {
            return 'vue-draggable-plus'
          }

          if (
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('class-variance-authority')
          ) {
            return 'tailwind-utils'
          }

          if (id.includes('/node_modules/@tabler/icons-vue/')) {
            return 'tabler-icons'
          }

          if (
            id.includes('/node_modules/vue/') ||
            id.includes('/node_modules/@vue/') ||
            id.includes('/node_modules/vue-router/') ||
            id.includes('/node_modules/pinia/') ||
            id.includes('/node_modules/@vueuse/')
          ) {
            return 'vue'
          }
        },
      },
    },
  },
}))
