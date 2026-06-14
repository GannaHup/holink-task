import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref<'success' | 'error'>('success')

let timeoutId: ReturnType<typeof setTimeout> | null = null

const show = (msg: string, toastType: 'success' | 'error' = 'success', duration = 3000) => {
  if (timeoutId) clearTimeout(timeoutId)

  message.value = msg
  type.value = toastType
  visible.value = true

  timeoutId = setTimeout(() => {
    visible.value = false
  }, duration)
}

export const useToast = () => ({
  visible,
  message,
  type,
  show,
  success: (msg: string, duration?: number) => show(msg, 'success', duration),
  error: (msg: string, duration?: number) => show(msg, 'error', duration),
  dismiss: () => {
    if (timeoutId) clearTimeout(timeoutId)
    visible.value = false
  },
})
