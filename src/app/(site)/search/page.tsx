'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/product/product-card'
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import { formatPrice } from '@/lib/utils/price'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchResult {
  products: Array<{
    id: string
    title: string
    slug: string
    basePrice: number
    comparePrice: number | null
    category: { name: string; slug: string }
    image: string
    inStock: boolean
    variants: number
    colors: string[]
  }>
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    categories: Array<{ name: string; slug: string; count: number }>
    colors: string[]
    materials: string[]
    sizes: string[]
  }
  appliedFilters: {
    q?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    colors?: string[]
    materials?: string[]
    sizes?: string[]
    sortBy?: string
    inStock?: boolean
  }
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || ''
  })
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('colors')?.split(',').filter(Boolean) || []
  )
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    searchParams.get('materials')?.split(',').filter(Boolean) || []
  )
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get('sizes')?.split(',').filter(Boolean) || []
  )
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest')
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const buildSearchUrl = useCallback(() => {
    const params = new URLSearchParams()
    
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    if (priceRange.min) params.set('minPrice', priceRange.min)
    if (priceRange.max) params.set('maxPrice', priceRange.max)
    if (selectedColors.length) params.set('colors', selectedColors.join(','))
    if (selectedMaterials.length) params.set('materials', selectedMaterials.join(','))
    if (selectedSizes.length) params.set('sizes', selectedSizes.join(','))
    if (sortBy !== 'newest') params.set('sortBy', sortBy)
    if (inStockOnly) params.set('inStock', 'true')
    if (currentPage > 1) params.set('page', currentPage.toString())

    return `/api/products/search?${params.toString()}`
  }, [debouncedSearchQuery, selectedCategory, priceRange, selectedColors, selectedMaterials, selectedSizes, sortBy, inStockOnly, currentPage])

  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(buildSearchUrl())
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [buildSearchUrl])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    if (priceRange.min) params.set('minPrice', priceRange.min)
    if (priceRange.max) params.set('maxPrice', priceRange.max)
    if (selectedColors.length) params.set('colors', selectedColors.join(','))
    if (selectedMaterials.length) params.set('materials', selectedMaterials.join(','))
    if (selectedSizes.length) params.set('sizes', selectedSizes.join(','))
    if (sortBy !== 'newest') params.set('sortBy', sortBy)
    if (inStockOnly) params.set('inStock', 'true')
    if (currentPage > 1) params.set('page', currentPage.toString())

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`
    router.replace(newUrl, { scroll: false })
  }, [debouncedSearchQuery, selectedCategory, priceRange, selectedColors, selectedMaterials, selectedSizes, sortBy, inStockOnly, currentPage, router])

  // Perform search when filters change
  useEffect(() => {
    performSearch()
  }, [performSearch])

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSelectedColors([])
    setSelectedMaterials([])
    setSelectedSizes([])
    setSortBy('newest')
    setInStockOnly(false)
    setCurrentPage(1)
  }

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case 'query':
        setSearchQuery('')
        break
      case 'category':
        setSelectedCategory('')
        break
      case 'price':
        setPriceRange({ min: '', max: '' })
        break
      case 'color':
        setSelectedColors(prev => prev.filter(c => c !== value))
        break
      case 'material':
        setSelectedMaterials(prev => prev.filter(m => m !== value))
        break
      case 'size':
        setSelectedSizes(prev => prev.filter(s => s !== value))
        break
      case 'inStock':
        setInStockOnly(false)
        break
    }
    setCurrentPage(1)
  }

  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setSelectedColors(prev => [...prev, color])
    } else {
      setSelectedColors(prev => prev.filter(c => c !== color))
    }
    setCurrentPage(1)
  }

  const handleMaterialChange = (material: string, checked: boolean) => {
    if (checked) {
      setSelectedMaterials(prev => [...prev, material])
    } else {
      setSelectedMaterials(prev => prev.filter(m => m !== material))
    }
    setCurrentPage(1)
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setSelectedSizes(prev => [...prev, size])
    } else {
      setSelectedSizes(prev => prev.filter(s => s !== size))
    }
    setCurrentPage(1)
  }

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    priceRange.min || priceRange.max,
    selectedColors.length > 0,
    selectedMaterials.length > 0,
    selectedSizes.length > 0,
    inStockOnly
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Search Products
            </h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for furniture, decor, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className={`space-y-6 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Active Filters</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Search: {searchQuery}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('query')} />
                        </Badge>
                      )}
                      {selectedCategory && searchResults && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {searchResults.filters.categories.find(c => c.slug === selectedCategory)?.name}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('category')} />
                        </Badge>
                      )}
                      {(priceRange.min || priceRange.max) && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {priceRange.min && priceRange.max 
                            ? `${formatPrice(parseFloat(priceRange.min))} - ${formatPrice(parseFloat(priceRange.max))}`
                            : priceRange.min 
                            ? `From ${formatPrice(parseFloat(priceRange.min))}`
                            : `Up to ${formatPrice(parseFloat(priceRange.max))}`
                          }
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('price')} />
                        </Badge>
                      )}
                      {selectedColors.map(color => (
                        <Badge key={color} variant="secondary" className="flex items-center gap-1">
                          {color}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('color', color)} />
                        </Badge>
                      ))}
                      {selectedMaterials.map(material => (
                        <Badge key={material} variant="secondary" className="flex items-center gap-1">
                          {material}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('material', material)} />
                        </Badge>
                      ))}
                      {selectedSizes.map(size => (
                        <Badge key={size} variant="secondary" className="flex items-center gap-1">
                          {size}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('size', size)} />
                        </Badge>
                      ))}
                      {inStockOnly && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          In Stock Only
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('inStock')} />
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Category Filter */}
              {searchResults?.filters?.categories && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">Category</h3>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {searchResults.filters.categories.map(category => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name} ({category.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Price Range Filter */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="minPrice" className="text-sm">Min Price</Label>
                      <Input
                        id="minPrice"
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPrice" className="text-sm">Max Price</Label>
                      <Input
                        id="maxPrice"
                        type="number"
                        placeholder="10000"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Color Filter */}
              {searchResults?.filters?.colors && searchResults.filters.colors.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">Colors</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.filters.colors.map(color => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={`color-${color}`}
                            checked={selectedColors.includes(color)}
                            onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                          />
                          <Label htmlFor={`color-${color}`} className="text-sm">
                            {color}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Material Filter */}
              {searchResults?.filters?.materials && searchResults.filters.materials.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">Materials</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.filters.materials.map(material => (
                        <div key={material} className="flex items-center space-x-2">
                          <Checkbox
                            id={`material-${material}`}
                            checked={selectedMaterials.includes(material)}
                            onCheckedChange={(checked) => handleMaterialChange(material, checked as boolean)}
                          />
                          <Label htmlFor={`material-${material}`} className="text-sm">
                            {material}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Size Filter */}
              {searchResults?.filters?.sizes && searchResults.filters.sizes.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">Sizes</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.filters.sizes.map(size => (
                        <div key={size} className="flex items-center space-x-2">
                          <Checkbox
                            id={`size-${size}`}
                            checked={selectedSizes.includes(size)}
                            onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                          />
                          <Label htmlFor={`size-${size}`} className="text-sm">
                            {size}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Availability Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(checked === true)}
                    />
                    <Label htmlFor="inStock">In Stock Only</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div>
                {loading ? (
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                ) : (
                  <p className="text-gray-600">
                    {searchResults?.pagination?.totalCount || 0} products found
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="name_asc">Name: A to Z</SelectItem>
                    <SelectItem value="name_desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                <span className="ml-2 text-gray-600">Searching products...</span>
              </div>
            )}

            {/* Results Grid */}
            {!loading && searchResults && (
              <>
                {searchResults.products?.length > 0 ? (
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }>
                    {searchResults.products?.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms or filters
                    </p>
                    <Button onClick={clearAllFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {searchResults.pagination?.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={!searchResults.pagination.hasPrev}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, searchResults.pagination.totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={!searchResults.pagination.hasNext}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
