import * as React from "react"

import { cn } from "@/lib/utils"

// Simple tooltip implementation
const TooltipContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  content: React.ReactNode
  setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>
  side?: "top" | "right" | "bottom" | "left"
  setSide: React.Dispatch<React.SetStateAction<"top" | "right" | "bottom" | "left">>
}>({
  open: false,
  setOpen: () => {},
  content: null,
  setContent: () => {},
  side: "top",
  setSide: () => {}
})

export function TooltipProvider({ children }: { children?: React.ReactNode } = {}) {
  const [open, setOpen] = React.useState(false)
  const [content, setContent] = React.useState<React.ReactNode>(null)
  const [side, setSide] = React.useState<"top" | "right" | "bottom" | "left">("top")

  return (
    <TooltipContext.Provider value={{ open, setOpen, content, setContent, side, setSide }}>
      {children}
    </TooltipContext.Provider>
  )
}

export interface TooltipProps {
  children?: React.ReactNode;
  content?: React.ReactNode;
  label?: string;
  placement?: string;
  hasArrow?: boolean;
  openDelay?: number;
  bg?: string;
  color?: string;
  borderRadius?: string;
  fontSize?: string;
  contentProps?: any;
  css?: any;
}

export function Tooltip({ 
  children, 
  content, 
  label, 
  placement,
  hasArrow,
  openDelay,
  bg,
  color,
  borderRadius,
  fontSize,
  contentProps,
  css,
  ...props 
}: TooltipProps) {
  // For backward compatibility, we'll return a simple wrapper
  return <>{children}</>
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function TooltipTrigger({
  asChild = false,
  children,
  ...props
}: TooltipTriggerProps) {
  const { setOpen, setContent, content, setSide } = React.useContext(TooltipContext)
  
  const handleMouseEnter = React.useCallback(() => {
    setOpen(true)
  }, [setOpen])
  
  const handleMouseLeave = React.useCallback(() => {
    setOpen(false)
  }, [setOpen])
  
  const childProps = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    ...props
  }
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, childProps as any)
  }
  
  return <span {...childProps}>{children}</span>
}

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  children?: React.ReactNode
  className?: string
}

export function TooltipContent({
  children,
  side = "top",
  className,
  ...props
}: TooltipContentProps) {
  const { open, setSide } = React.useContext(TooltipContext)
  
  React.useEffect(() => {
    setSide(side)
  }, [side, setSide])
  
  if (!open) {
    return null
  }
  
  return (
    <div
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
      data-side={side}
    >
      {children}
    </div>
  )
} 