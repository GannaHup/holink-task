import type { VariantProps } from 'class-variance-authority'
import type { buttonVariants } from './Button.variants'

export type ButtonVariants = VariantProps<typeof buttonVariants>

export interface ButtonProps {
  variant?: NonNullable<ButtonVariants['variant']>
  size?: NonNullable<ButtonVariants['size']>
  loading?: boolean
  class?: string
}
