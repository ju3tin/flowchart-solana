import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#366dff] text-white hover:bg-[#366dff]/80",
        secondary:
          "border-transparent bg-[#2A3347] text-[#E9ECEF] hover:bg-[#2A3347]/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-[#E9ECEF] border-[#2A3347]",
        status: "bg-[#1d1e2a] text-[#0ea5e9] border-[#0ea5e930]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "status";
  className?: string;
  css?: any; // For ChakraUI compatibility
  borderColor?: string; // For ChakraUI compatibility
  colorScheme?: string; // For ChakraUI compatibility
}

function Badge({ 
  className, 
  variant = "default", 
  css, 
  borderColor,
  colorScheme,
  ...props 
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 