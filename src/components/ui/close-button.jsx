'use client'

import { Button } from "@/components/ui/button"
import * as React from 'react'
import { LuX } from 'react-icons/lu'

export const CloseButton = React.forwardRef(function CloseButton(props, ref) {
  return (
    <Button 
      variant="ghost" 
      size="icon"
      aria-label="Close" 
      ref={ref} 
      {...props}
    >
      {props.children ?? <LuX className="h-4 w-4" />}
    </Button>
  )
})
