import { cva } from 'class-variance-authority'

export const textareaVariants = cva(
  'w-full resize-none rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2',
  {
    variants: {
      state: {
        default: 'border-input focus:border-indigo-500 focus:ring-indigo-500/30',
        error: 'border-destructive focus:border-destructive focus:ring-destructive/30',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
)
