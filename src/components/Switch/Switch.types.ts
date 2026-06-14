import type { VariantProps } from 'class-variance-authority'
import type { switchVariants } from './Switch.variants'

export type SwitchVariants = VariantProps<typeof switchVariants>

export interface SwitchProps {
  modelValue?: boolean
  size?: NonNullable<SwitchVariants['size']>
  disabled?: boolean
  class?: string
}
