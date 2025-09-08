'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'

interface ProductFiltersProps {
  availableFilters: {
    colors: string[]
    sizes: string[]
  }
  currentFilters: {
    search?: string
    minPrice?: number
    maxPrice?: number
    colors?: string[]
    sizes?: string[]
    sort?: string
  }
}

export function ProductFilters({ availableFilters, currentFilters }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localFilters, setLocalFilters] = useState({
    minPrice: currentFilters.minPrice?.toString() || '',
    maxPrice: currentFilters.maxPrice?.toString() || '',
    colors: currentFilters.colors || [],
    sizes: currentFilters.sizes || [],
  })

  const updateURL = (newFilters: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.delete(key)
        value.forEach(v => params.append(key, v))
      } else {
        params.set(key, value.toString())
      }
    })

    // Reset to page 1 when filters change
    params.set('page', '1')
    
    router.push(`?${params.toString()}`)
  }

  const handlePriceFilter = () => {
    updateURL({
      minPrice: localFilters.minPrice || undefined,
      maxPrice: localFilters.maxPrice || undefined,
    })
  }

  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked
      ? [...localFilters.colors, color]
      : localFilters.colors.filter(c => c !== color)
    
    setLocalFilters(prev => ({ ...prev, colors: newColors }))
    updateURL({ colors: newColors })
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...localFilters.sizes, size]
      : localFilters.sizes.filter(s => s !== size)
    
    setLocalFilters(prev => ({ ...prev, sizes: newSizes }))
    updateURL({ sizes: newSizes })
  }

  const handleSortChange = (sort: string) => {
    updateURL({ sort })
  }

  const clearAllFilters = () => {
    setLocalFilters({
      minPrice: '',
      maxPrice: '',
      colors: [],
      sizes: [],
    })
    router.push(window.location.pathname)
  }

  const hasActiveFilters = currentFilters.minPrice || currentFilters.maxPrice || 
    (currentFilters.colors && currentFilters.colors.length > 0) ||
    (currentFilters.sizes && currentFilters.sizes.length > 0)

  return (
    <div className="space-y-6">
      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currentFilters.sort || 'newest'} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice" className="text-sm">Min</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={localFilters.minPrice}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-sm">Max</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000"
                value={localFilters.maxPrice}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handlePriceFilter} size="sm" className="w-full">
            Apply Price Filter
          </Button>
        </CardContent>
      </Card>

      {/* Colors */}
      {availableFilters.colors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableFilters.colors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={localFilters.colors.includes(color)}
                    onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                  />
                  <Label htmlFor={`color-${color}`} className="text-sm font-normal">
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sizes */}
      {availableFilters.sizes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableFilters.sizes.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={localFilters.sizes.includes(size)}
                    onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                  />
                  <Label htmlFor={`size-${size}`} className="text-sm font-normal">
                    {size}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button onClick={clearAllFilters} variant="outline" size="sm" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  )
}
