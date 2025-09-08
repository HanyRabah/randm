'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Search } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  variants: Array<{
    id: string
    sku: string
    inventory: number
  }>
}

interface AlertFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: {
    id?: string
    productId?: string
    variantId?: string
    threshold: number
    alertType: 'LOW_STOCK' | 'OUT_OF_STOCK'
    isActive: boolean
  }
}

export function AlertForm({ onSuccess, onCancel, initialData }: AlertFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  const [formData, setFormData] = useState({
    productId: initialData?.productId || '',
    variantId: initialData?.variantId || '',
    threshold: initialData?.threshold || 5,
    alertType: initialData?.alertType || 'LOW_STOCK' as 'LOW_STOCK' | 'OUT_OF_STOCK',
    isActive: initialData?.isActive ?? true
  })

  // Fetch products for selection
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products?limit=50')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  // Set selected product when productId changes
  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.id === formData.productId)
      setSelectedProduct(product || null)
    } else {
      setSelectedProduct(null)
    }
  }, [formData.productId, products])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productId && !formData.variantId) {
      toast({
        title: 'Validation Error',
        description: 'Please select either a product or variant',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const url = initialData?.id 
        ? `/api/admin/inventory/alerts/${initialData.id}`
        : '/api/admin/inventory/alerts'
      
      const method = initialData?.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: formData.productId || undefined,
          variantId: formData.variantId || undefined,
          threshold: formData.threshold,
          alertType: formData.alertType,
          isActive: formData.isActive
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Alert ${initialData?.id ? 'updated' : 'created'} successfully`
        })
        onSuccess?.()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to save alert',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {initialData?.id ? 'Edit Inventory Alert' : 'Create Inventory Alert'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product-search">Search Products</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="product-search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {searchTerm && (
            <div className="space-y-2">
              <Label>Select Product</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                      formData.productId === product.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        productId: product.id,
                        variantId: '' // Clear variant when product changes
                      }))
                      setSearchTerm('')
                    }}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.slug}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variant Selection */}
          {selectedProduct && selectedProduct.variants.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="variant">Variant (Optional)</Label>
              <Select
                value={formData.variantId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, variantId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variant (leave empty for product-level alert)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Product-level alert</SelectItem>
                  {selectedProduct.variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.sku} (Stock: {variant.inventory})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Alert Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                value={formData.threshold}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  threshold: parseInt(e.target.value) || 0 
                }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert-type">Alert Type</Label>
              <Select
                value={formData.alertType}
                onValueChange={(value: 'LOW_STOCK' | 'OUT_OF_STOCK') => 
                  setFormData(prev => ({ ...prev, alertType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              id="is-active"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is-active">Active</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData?.id ? 'Update Alert' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
