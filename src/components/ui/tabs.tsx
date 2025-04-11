import * as React from "react"

import { cn } from "@/lib/utils"

// We'll create a simpler version since we don't have Radix UI
const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
  }
>(({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value)
  
  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])
  
  const handleTabChange = (tabValue: string) => {
    if (onValueChange) {
      onValueChange(tabValue)
    }
    if (value === undefined) {
      setActiveTab(tabValue)
    }
  }
  
  const tabsContext = React.useMemo(() => ({
    value: activeTab,
    onValueChange: handleTabChange
  }), [activeTab, handleTabChange])
  
  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      <TabsContext.Provider value={tabsContext}>
        {children}
      </TabsContext.Provider>
    </div>
  )
})

const TabsContext = React.createContext<{
  value?: string
  onValueChange: (value: string) => void
}>({
  onValueChange: () => {}
})

// Simple TabsList
const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center space-x-1 rounded-none bg-transparent border-b border-[#2A3347]",
      className
    )}
    {...props}
  />
))

// Simple TabsTrigger
const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => {
  const { value: activeTab, onValueChange } = React.useContext(TabsContext)
  
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        activeTab === value 
          ? "bg-[#366dff] text-white" 
          : "text-[#A0AEC0] hover:bg-[#2A3347]",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    />
  )
})

// Simple TabsContent
const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => {
  const { value: activeTab } = React.useContext(TabsContext)
  
  if (activeTab !== value) {
    return null
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "mt-0 p-0 m-0 data-[state=active]:flex focus-visible:outline-none bg-[#121620]",
        className
      )}
      data-state={activeTab === value ? "active" : "inactive"}
      {...props}
    />
  )
})

Tabs.displayName = "Tabs"
TabsList.displayName = "TabsList"
TabsTrigger.displayName = "TabsTrigger"
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }