import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#366dff] text-white shadow hover:bg-[#366dff]/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-[#2A3347] bg-transparent shadow-sm hover:bg-[#2A3347] hover:text-white",
        secondary:
          "bg-[#2A3347] text-[#E9ECEF] shadow-sm hover:bg-[#366dff] hover:bg-opacity-70",
        ghost: "hover:bg-[#2A3347] hover:text-[#E9ECEF]",
        link: "text-[#366dff] underline-offset-4 hover:underline",
        chain: "text-[#A0AEC0] hover:bg-[#2A3347] data-[active=true]:bg-[#2A3347] data-[active=true]:text-[#E9ECEF] data-[active=true]:border-b-2 data-[active=true]:border-[#80a3ff]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }