import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductOptions } from '@/components/product/product-options'

const mockProduct = {
  id: '1',
  title: 'Test Product',
  options: [
    {
      id: 'color-option',
      name: 'Color',
      values: [
        { id: 'red', value: 'Red', hexColor: '#ff0000' },
        { id: 'blue', value: 'Blue', hexColor: '#0000ff' }
      ]
    },
    {
      id: 'size-option', 
      name: 'Size',
      values: [
        { id: 'small', value: 'Small' },
        { id: 'large', value: 'Large' }
      ]
    }
  ],
  variants: [
    {
      id: 'variant-1',
      sku: 'TEST-RED-SMALL',
      price: 100,
      inventory: 10,
      isDefault: true,
      options: [
        { id: 'red', value: 'Red', option: { name: 'Color' } },
        { id: 'small', value: 'Small', option: { name: 'Size' } }
      ]
    },
    {
      id: 'variant-2',
      sku: 'TEST-RED-LARGE',
      price: 120,
      inventory: 0, // Out of stock
      isDefault: false,
      options: [
        { id: 'red', value: 'Red', option: { name: 'Color' } },
        { id: 'large', value: 'Large', option: { name: 'Size' } }
      ]
    },
    {
      id: 'variant-3',
      sku: 'TEST-BLUE-SMALL',
      price: 110,
      inventory: 5,
      isDefault: false,
      options: [
        { id: 'blue', value: 'Blue', option: { name: 'Color' } },
        { id: 'small', value: 'Small', option: { name: 'Size' } }
      ]
    }
  ]
}

describe('ProductOptions', () => {
  const mockOnVariantChange = vi.fn()

  beforeEach(() => {
    mockOnVariantChange.mockClear()
  })

  it('renders product options correctly', () => {
    render(
      <ProductOptions 
        product={mockProduct}
        onVariantChange={mockOnVariantChange}
      />
    )

    expect(screen.getByText('Color')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
    expect(screen.getByText('Red')).toBeInTheDocument()
    expect(screen.getByText('Blue')).toBeInTheDocument()
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('shows color swatches for color options', () => {
    render(
      <ProductOptions 
        product={mockProduct}
        onVariantChange={mockOnVariantChange}
      />
    )

    const colorSwatches = screen.getAllByTestId(/color-swatch/)
    expect(colorSwatches).toHaveLength(2)
  })

  it('disables out-of-stock options', () => {
    render(
      <ProductOptions 
        product={mockProduct}
        onVariantChange={mockOnVariantChange}
      />
    )

    // Select Red first
    fireEvent.click(screen.getByText('Red'))
    
    // Large should be disabled because Red+Large variant is out of stock
    const largeButton = screen.getByText('Large')
    expect(largeButton).toHaveClass('opacity-50')
  })

  it('calls onVariantChange when valid combination is selected', () => {
    render(
      <ProductOptions 
        product={mockProduct}
        onVariantChange={mockOnVariantChange}
      />
    )

    // Select Blue
    fireEvent.click(screen.getByText('Blue'))
    
    // Should call with Blue+Small variant (default size)
    expect(mockOnVariantChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'variant-3',
        sku: 'TEST-BLUE-SMALL'
      })
    )
  })

  it('shows clear buttons for selected options', () => {
    render(
      <ProductOptions 
        product={mockProduct}
        onVariantChange={mockOnVariantChange}
      />
    )

    // Select an option
    fireEvent.click(screen.getByText('Blue'))
    
    // Clear button should appear
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('clears individual options when clear button is clicked', () => {
    render(
      <ProductOptions 
        product={mockProduct}
        onVariantChange={mockOnVariantChange}
      />
    )

    // Select Blue
    fireEvent.click(screen.getByText('Blue'))
    
    // Click clear button
    fireEvent.click(screen.getByText('Clear'))
    
    // Should reset to default variant
    expect(mockOnVariantChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'variant-1',
        isDefault: true
      })
    )
  })

  it('shows selected configuration summary', () => {
    render(
      <ProductOptions 
        product={mockProduct}
        onVariantChange={mockOnVariantChange}
      />
    )

    // Select Blue
    fireEvent.click(screen.getByText('Blue'))
    
    // Should show selected configuration
    expect(screen.getByText('Selected Configuration')).toBeInTheDocument()
    expect(screen.getByText('Color: Blue')).toBeInTheDocument()
  })

  it('handles products with no variants gracefully', () => {
    const productWithNoVariants = {
      ...mockProduct,
      variants: []
    }

    render(
      <ProductOptions 
        product={productWithNoVariants}
        onVariantChange={mockOnVariantChange}
      />
    )

    // Should still render options but all should be disabled
    expect(screen.getByText('Color')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
  })
})
