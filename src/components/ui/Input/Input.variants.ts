import { cva } from 'class-variance-authority'

export const inputVariants = cva(
  'w-full rounded-lg border bg-card py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2',
  {
    variants: {
      state: {
        default: 'border-input focus:border-indigo-500 focus:ring-indigo-500/30',
        error: 'border-destructive focus:border-destructive focus:ring-destructive/30',
      },
      hasPrefix: {
        true: 'pl-8 pr-3',
        false: 'px-3',
      },
    },
    defaultVariants: {
      state: 'default',
      hasPrefix: false,
    },
  },
)
