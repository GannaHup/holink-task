import { ref } from 'vue'

export const useToast = () => {
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

  const success = (msg: string, duration?: number) => {
    show(msg, 'success', duration)
  }

  const error = (msg: string, duration?: number) => {
    show(msg, 'error', duration)
  }

  const dismiss = () => {
    if (timeoutId) clearTimeout(timeoutId)
    visible.value = false
  }

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
