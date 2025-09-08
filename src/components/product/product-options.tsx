'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

interface ProductOption {
  id: string
  name: string
  values: Array<{
    id: string
    value: string
    hexColor?: string
  }>
}

interface Variant {
  id: string
  sku: string
  price: number
  comparePrice?: number
  inventory: number
  isDefault: boolean
  options: Array<{
    id: string
    value: string
    option: {
      name: string
    }
  }>
}

interface ProductOptionsProps {
  options: ProductOption[]
  variants: Variant[]
  selectedVariant?: Variant
  onVariantChange: (variant: Variant) => void
  className?: string
}

export function ProductOptions({ 
  options, 
  variants, 
  selectedVariant, 
  onVariantChange,
  className 
}: ProductOptionsProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (selectedVariant) {
      const opts: Record<string, string> = {}
      selectedVariant.options.forEach((option) => {
        opts[option.option.name] = option.value
      })
      return opts
    }
    return {}
  })

  const handleOptionChange = (optionName: string, value: string) => {
    const newSelectedOptions = { ...selectedOptions, [optionName]: value }
    setSelectedOptions(newSelectedOptions)

    // Find matching variant
    const matchingVariant = variants.find(variant => {
      return options.every(option => {
        const selectedValue = newSelectedOptions[option.name]
        if (!selectedValue) return false
        
        return variant.options.some(variantOption => 
          variantOption.option.name === option.name && 
          variantOption.value === selectedValue
        )
      })
    })

    if (matchingVariant) {
      onVariantChange(matchingVariant)
    }
  }

  const isOptionValueAvailable = (optionName: string, value: string) => {
    const otherSelections = { ...selectedOptions }
    delete otherSelections[optionName]
    
    return variants.some(variant => {
      if (variant.inventory === 0) return false
      
      const hasThisOption = variant.options.some(vo => 
        vo.option.name === optionName && vo.value === value
      )
      
      if (!hasThisOption) return false
      
      return Object.entries(otherSelections).every(([otherOptionName, otherValue]) => {
        return variant.options.some(vo => 
          vo.option.name === otherOptionName && vo.value === otherValue
        )
      })
    })
  }

  const clearOption = (optionName: string) => {
    const newOptions = { ...selectedOptions }
    delete newOptions[optionName]
    setSelectedOptions(newOptions)
  }

  const clearAllOptions = () => {
    setSelectedOptions({})
  }

  if (options.length === 0) return null

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with clear all button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Choose Options</h3>
        {Object.keys(selectedOptions).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllOptions}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {options.map((option) => (
        <div key={option.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium flex items-center gap-2">
              {option.name}
              {selectedOptions[option.name] && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  {selectedOptions[option.name]}
                </Badge>
              )}
            </Label>
            {selectedOptions[option.name] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearOption(option.name)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
          
          {option.name.toLowerCase() === 'color' ? (
            // Enhanced color swatches
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value.value
                const isAvailable = isOptionValueAvailable(option.name, value.value)
                
                return (
                  <div key={value.id} className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => isAvailable && handleOptionChange(option.name, value.value)}
                      disabled={!isAvailable}
                      className={cn(
                        'w-12 h-12 rounded-lg border-2 transition-all relative shadow-sm',
                        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        isSelected 
                          ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105' 
                          : 'border-gray-200 hover:border-gray-300',
                        !isAvailable && 'opacity-40 cursor-not-allowed'
                      )}
                      style={{ 
                        backgroundColor: value.hexColor || '#e5e7eb',
                      }}
                      title={`${value.value} ${!isAvailable ? '(Out of Stock)' : ''}`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white drop-shadow-lg" />
                        </div>
                      )}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-0.5 bg-red-500 rotate-45 absolute" />
                          <div className="w-8 h-0.5 bg-red-500 -rotate-45 absolute" />
                        </div>
                      )}
                    </button>
                    <span className={cn(
                      'text-xs font-medium text-center max-w-[60px] truncate',
                      isSelected ? 'text-primary' : 'text-muted-foreground',
                      !isAvailable && 'line-through opacity-50'
                    )}>
                      {value.value}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            // Enhanced buttons for sizes, materials, etc.
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value.value
                const isAvailable = isOptionValueAvailable(option.name, value.value)
                
                return (
                  <Button
                    key={value.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => isAvailable && handleOptionChange(option.name, value.value)}
                    disabled={!isAvailable}
                    className={cn(
                      'min-w-[80px] h-10 transition-all relative',
                      'hover:scale-105 focus:scale-105',
                      isSelected && 'ring-2 ring-primary ring-offset-1 shadow-md',
                      !isAvailable && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className={cn(!isAvailable && 'line-through')}>
                      {value.value}
                    </span>
                    {isSelected && (
                      <Check className="h-3 w-3 ml-2" />
                    )}
                    {!isAvailable && (
                      <X className="h-3 w-3 ml-2 text-red-500" />
                    )}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {/* Selected options summary */}
      {Object.keys(selectedOptions).length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg border">
          <h4 className="text-sm font-medium mb-2">Selected Configuration:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedOptions).map(([optionName, value]) => (
              <Badge key={optionName} variant="secondary" className="text-xs">
                {optionName}: {value}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
