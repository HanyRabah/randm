'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ProductOption {
  id: string
  name: string
  values: OptionValue[]
}

interface OptionValue {
  id: string
  value: string
  hexColor?: string
}

interface Variant {
  id: string
  sku: string
  price: number
  comparePrice?: number
  inventory: number
  options: { [optionName: string]: string }
  isDefault: boolean
}

interface ProductImage {
  id: string
  url: string
  altText: string
  file?: File
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    basePrice: '',
    comparePrice: '',
    weight: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    status: 'PUBLISHED'
  })
  
  // Product options and variants
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  
  // Load categories
  useEffect(() => {
    fetchCategories()
  }, [])
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Upload images first
      const uploadedImages = await uploadImages()
      
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        options,
        variants,
        images: uploadedImages
      }
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      if (response.ok) {
        router.push('/admin/products')
      } else {
        throw new Error('Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const uploadImages = async (): Promise<ProductImage[]> => {
    const uploadPromises = images.map(async (image) => {
      if (image.file) {
        const formData = new FormData()
        formData.append('file', image.file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const { url } = await response.json()
          return { ...image, url }
        }
      }
      return image
    })
    
    return Promise.all(uploadPromises)
  }
  
  // Product Options Management
  const addOption = () => {
    const newOption: ProductOption = {
      id: `option-${Date.now()}`,
      name: '',
      values: []
    }
    setOptions([...options, newOption])
  }
  
  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
    // Clear variants when options change
    setVariants([])
  }
  
  const updateOptionName = (index: number, name: string) => {
    const updatedOptions = [...options]
    updatedOptions[index].name = name
    setOptions(updatedOptions)
  }
  
  const addOptionValue = (optionIndex: number) => {
    const newValue: OptionValue = {
      id: `value-${Date.now()}`,
      value: '',
      hexColor: undefined
    }
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values.push(newValue)
    setOptions(updatedOptions)
  }
  
  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values = updatedOptions[optionIndex].values.filter((_, i) => i !== valueIndex)
    setOptions(updatedOptions)
    // Clear variants when option values change
    setVariants([])
  }
  
  const updateOptionValue = (optionIndex: number, valueIndex: number, field: 'value' | 'hexColor', value: string) => {
    const updatedOptions = [...options]
    if (field === 'hexColor') {
      updatedOptions[optionIndex].values[valueIndex].hexColor = value
    } else {
      updatedOptions[optionIndex].values[valueIndex].value = value
    }
    setOptions(updatedOptions)
  }
  
  // Variant Management
  const generateVariants = () => {
    if (options.length === 0) return
    
    // Generate all possible combinations
    const combinations = generateCombinations(options)
    const newVariants: Variant[] = combinations.map((combo, index) => {
      const sku = `${formData.title.replace(/\s+/g, '-').toUpperCase()}-${index + 1}`
      return {
        id: `variant-${Date.now()}-${index}`,
        sku,
        price: parseFloat(formData.basePrice) || 0,
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        inventory: 0,
        options: combo,
        isDefault: index === 0
      }
    })
    
    setVariants(newVariants)
  }
  
  const generateCombinations = (options: ProductOption[]): { [key: string]: string }[] => {
    if (options.length === 0) return []
    
    const result: { [key: string]: string }[] = [{}]
    
    for (const option of options) {
      if (option.values.length === 0) continue
      
      const newResult: { [key: string]: string }[] = []
      for (const combo of result) {
        for (const value of option.values) {
          newResult.push({ ...combo, [option.name]: value.value })
        }
      }
      result.length = 0
      result.push(...newResult)
    }
    
    return result
  }
  
  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updatedVariants = [...variants]
    if (field === 'isDefault' && value) {
      // Only one variant can be default
      updatedVariants.forEach((v, i) => {
        v.isDefault = i === index
      })
    } else {
      (updatedVariants[index] as any)[field] = value
    }
    setVariants(updatedVariants)
  }
  
  // Image Management
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages: ProductImage[] = files.map((file, index) => ({
      id: `image-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      altText: '',
      file
    }))
    setImages([...images, ...newImages])
  }
  
  const updateImage = (index: number, field: 'altText', value: string) => {
    const updatedImages = [...images]
    updatedImages[index][field] = value
    setImages(updatedImages)
  }
  
  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new furniture product for your catalog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Name</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Modern Coffee Table"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your furniture piece..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price ($)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparePrice">Compare Price ($)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="modern, furniture, table"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="active" 
                  checked={formData.status === 'PUBLISHED'}
                  onCheckedChange={(checked: boolean) => handleInputChange('status', checked ? 'PUBLISHED' : 'DRAFT')}
                />
                <Label htmlFor="active">Active (visible to customers)</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Product Options
              <Button type="button" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {options.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No options added yet. Add options like Color, Size, Material, etc.
              </p>
            ) : (
              options.map((option, optionIndex) => (
                <div key={option.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Input
                      placeholder="Option name (e.g., Color, Size)"
                      value={option.name}
                      onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                      className="flex-1 mr-4"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Option Values</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOptionValue(optionIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Value
                      </Button>
                    </div>
                    
                    <div className="grid gap-2">
                      {option.values.map((value, valueIndex) => (
                        <div key={value.id} className="flex items-center gap-2">
                          <Input
                            placeholder="Value (e.g., Red, Large)"
                            value={value.value}
                            onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'value', e.target.value)}
                            className="flex-1"
                          />
                          {option.name.toLowerCase() === 'color' && (
                            <Input
                              type="color"
                              value={value.hexColor || '#000000'}
                              onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'hexColor', e.target.value)}
                              className="w-16"
                            />
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOptionValue(optionIndex, valueIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Product Variants */}
        {options.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Product Variants
                <Button type="button" size="sm" onClick={generateVariants}>
                  Generate Variants
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {variants.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Click "Generate Variants" to create all possible combinations
                </p>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="border rounded-lg p-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <Label>SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            placeholder="SKU"
                          />
                        </div>
                        <div>
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Compare Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.comparePrice || ''}
                            onChange={(e) => updateVariant(index, 'comparePrice', parseFloat(e.target.value) || undefined)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Inventory</Label>
                          <Input
                            type="number"
                            value={variant.inventory}
                            onChange={(e) => updateVariant(index, 'inventory', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">Options:</span>
                          {Object.entries(variant.options).map(([optionName, optionValue]) => (
                            <span key={optionName} className="text-sm bg-muted px-2 py-1 rounded">
                              {optionName}: {optionValue}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={variant.isDefault}
                            onCheckedChange={(checked: boolean) => updateVariant(index, 'isDefault', checked)}
                          />
                          <Label>Default</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {image.url ? (
                    <div className="relative w-20 h-20">
                      <Image
                        src={image.url}
                        alt={image.altText}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Alt text"
                      value={image.altText}
                      onChange={(e) => updateImage(index, 'altText', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload product images</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Images
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Section */}
        <Card>
          <CardHeader>
            <CardTitle>SEO & Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                placeholder="SEO optimized title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('seoDescription', e.target.value)}
                placeholder="SEO meta description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  )
}
