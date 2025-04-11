'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

const Slider = React.forwardRef(function Slider(
  { className, min = 0, max = 100, step = 1, defaultValue, value, onValueChange, marks = [], label, showValue, disabled, ...props },
  ref
) {
  const sliderValue = value || defaultValue || [min]
  
  const formatMarks = React.useMemo(() => {
    if (!marks?.length) return []
    
    return marks.map(mark => {
      if (typeof mark === 'number') return { value: mark, label: undefined }
      return mark
    })
  }, [marks])

  const hasMarkLabel = formatMarks.some(mark => mark.label)

  return (
    <div className="w-full space-y-2">
      {label && !showValue && <div className="text-sm font-medium">{label}</div>}
      {label && showValue && (
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-sm text-muted-foreground">{Array.isArray(sliderValue) ? sliderValue[0] : sliderValue}</div>
        </div>
      )}
      
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onValueChange={onValueChange}
        disabled={disabled}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        
        {formatMarks.length > 0 && (
          <div className="absolute w-full top-7 flex" data-has-labels={hasMarkLabel ? 'true' : undefined}>
            {formatMarks.map((mark, index) => {
              const percent = ((mark.value - min) / (max - min)) * 100
              return (
                <div
                  key={index}
                  className="absolute flex flex-col items-center"
                  style={{ left: `calc(${percent}% - 4px)` }}
                >
                  <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                  {mark.label && <span className="mt-1 text-xs text-muted-foreground">{mark.label}</span>}
                </div>
              )
            })}
          </div>
        )}
        
        {sliderValue.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  )
})

export { Slider }
