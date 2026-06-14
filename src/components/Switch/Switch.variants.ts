import { cva } from 'class-variance-authority'

export const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
  {
    variants: {
      size: {
        default: 'h-5 w-9',
        sm: 'h-4 w-7',
        lg: 'h-6 w-11',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-all duration-200 ease-in-out data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0 data-[state=checked]:scale-100 data-[state=unchecked]:scale-95',
  {
    variants: {
      size: {
        default: 'h-4 w-4',
        sm: 'h-3 w-3',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)
