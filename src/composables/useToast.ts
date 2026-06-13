import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref<'success' | 'error'>('success')

let timeoutId: ReturnType<typeof setTimeout> | null = null

function show(msg: string, toastType: 'success' | 'error' = 'success', duration = 3000) {
  if (timeoutId) clearTimeout(timeoutId)

  message.value = msg
  type.value = toastType
  visible.value = true

  timeoutId = setTimeout(() => {
    visible.value = false
  }, duration)
}

function success(msg: string, duration?: number) {
  show(msg, 'success', duration)
}

function error(msg: string, duration?: number) {
  show(msg, 'error', duration)
}

function dismiss() {
  if (timeoutId) clearTimeout(timeoutId)
  visible.value = false
}

export function useToast() {
  return {
    visible,
    message,
    type,
    show,
    success,
    error,
    dismiss,
  }
}
