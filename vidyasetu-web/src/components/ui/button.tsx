import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2",
  {
    variants: {
      variant: {
        // Primary - Main action button
        primary: "bg-primary text-text hover:bg-primary/90 shadow-sm focus:ring-primary/20",

        // Secondary - Less prominent actions (outlined)
        secondary:
          "bg-transparent text-text border-2 border-border hover:border-primary hover:text-primary focus:ring-primary/20",

        // Ghost - Minimal style for subtle actions
        ghost: "text-text-secondary hover:bg-surface hover:text-text focus:ring-primary/10",

        // Danger - Destructive actions
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm focus:ring-red-500/20",

        // Link - Text-only button
        link: "text-primary hover:underline underline-offset-4 focus:ring-0",
      },
      size: {
        sm: "h-8 px-3 py-1.5 text-xs rounded-md",
        default: "h-9 px-4 py-2.5",
        lg: "h-11 px-6 py-3 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const content = (
      <>
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </>
    )

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
