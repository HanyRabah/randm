/**
 * Format price in Egyptian Pounds (EGP)
 * @param price - Price value as number or string
 * @param showCurrency - Whether to show currency symbol (default: true)
 * @returns Formatted price string
 */
export function formatPrice(price: number | string, showCurrency: boolean = true): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice)) {
    return showCurrency ? 'EGP 0.00' : '0.00'
  }

  const formatted = numPrice.toLocaleString('en-EN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return showCurrency ? `EGP ${formatted}` : formatted
}

/**
 * Format price range for products with variants
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice)
  }
  
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
}

/**
 * Calculate discount percentage
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Discount percentage as number
 */
export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) {
    return 0
  }
  
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
}
