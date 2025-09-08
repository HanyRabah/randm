'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface VariantSelectorProps {
  product: {
    options: Array<{
      id: string
      name: string
      values: Array<{
        id: string
        value: string
        hexColor?: string
      }>
    }>
    variants: Array<{
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
    }>
  }
  selectedVariant: any
  onVariantChange: (variant: any) => void
}

export function VariantSelector({ product, selectedVariant, onVariantChange }: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // Initialize selected options from the default variant
  useEffect(() => {
    if (selectedVariant) {
      const options: Record<string, string> = {}
      selectedVariant.options.forEach((option: any) => {
        options[option.option.name] = option.value
      })
      setSelectedOptions(options)
    }
  }, [selectedVariant])

  const handleOptionChange = (optionName: string, value: string) => {
    const newSelectedOptions = { ...selectedOptions, [optionName]: value }
    setSelectedOptions(newSelectedOptions)

    // Find the variant that matches all selected options
    const matchingVariant = product.variants.find(variant => {
      return product.options.every(option => {
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
    // Check if there's a variant available with this option value and current other selections
    const otherSelections = { ...selectedOptions }
    delete otherSelections[optionName]
    
    return product.variants.some(variant => {
      if (variant.inventory === 0) return false
      
      const hasThisOption = variant.options.some(vo => 
        vo.option.name === optionName && vo.value === value
      )
      
      if (!hasThisOption) return false
      
      // Check if this variant matches other selected options
      return Object.entries(otherSelections).every(([otherOptionName, otherValue]) => {
        return variant.options.some(vo => 
          vo.option.name === otherOptionName && vo.value === otherValue
        )
      })
    })
  }

  return (
    <div className="space-y-6">
      {product.options.map((option) => (
        <div key={option.id} className="space-y-3">
          <Label className="text-base font-medium">{option.name}</Label>
          
          {option.name.toLowerCase() === 'color' ? (
            // Color swatches
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value.value
                  const isAvailable = isOptionValueAvailable(option.name, value.value)
                  
                  return (
                    <div key={value.id} className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => handleOptionChange(option.name, value.value)}
                        disabled={!isAvailable}
                        className={cn(
                          'w-10 h-10 rounded-full border-2 transition-all relative',
                          isSelected 
                            ? 'border-primary ring-2 ring-primary ring-offset-2 scale-110' 
                            : 'border-gray-300 hover:border-primary hover:scale-105',
                          !isAvailable && 'opacity-50 cursor-not-allowed'
                        )}
                        style={{ 
                          backgroundColor: value.hexColor || '#ccc',
                        }}
                        title={`${value.value} ${!isAvailable ? '(Out of Stock)' : ''}`}
                      >
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-0.5 bg-red-500 rotate-45 absolute" />
                          </div>
                        )}
                      </button>
                      <span className={cn(
                        'text-xs font-medium text-center',
                        isSelected ? 'text-primary' : 'text-muted-foreground',
                        !isAvailable && 'line-through opacity-50'
                      )}>
                        {value.value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            // Regular buttons for sizes, etc.
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value.value
                const isAvailable = isOptionValueAvailable(option.name, value.value)
                
                return (
                  <Button
                    key={value.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleOptionChange(option.name, value.value)}
                    disabled={!isAvailable}
                    className={cn(
                      'min-w-[60px] transition-all',
                      isSelected && 'ring-2 ring-primary ring-offset-1',
                      !isAvailable && 'opacity-50 cursor-not-allowed line-through'
                    )}
                  >
                    {value.value}
                    {!isAvailable && (
                      <span className="ml-1 text-xs text-red-500">✕</span>
                    )}
                  </Button>
                )
              })}
            </div>
          )}
          
          {/* Show selected value with enhanced styling */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{selectedOptions[option.name] || 'None'}</span>
            </p>
            {selectedOptions[option.name] && (
              <button
                onClick={() => {
                  const newOptions = { ...selectedOptions }
                  delete newOptions[option.name]
                  setSelectedOptions(newOptions)
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
