import { z } from 'zod'

// Product validations
export const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  basePrice: z.number().min(0, 'Price must be positive'),
  comparePrice: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

export const variantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  comparePrice: z.number().min(0).optional(),
  inventory: z.number().int().min(0, 'Inventory must be non-negative'),
  weight: z.number().min(0).optional(),
  isDefault: z.boolean().default(false),
  options: z.array(z.string()).default([]),
})

// Category validations
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().default(0),
})

// Coupon validations
export const couponSchema = z.object({
  code: z.string().min(1, 'Code is required').toUpperCase(),
  type: z.enum(['PERCENT', 'FIXED', 'FREESHIP']),
  value: z.number().min(0, 'Value must be positive'),
  minSubtotal: z.number().min(0).optional(),
  maxRedemptions: z.number().int().min(1).optional(),
  perCustomer: z.number().int().min(1).default(1),
  startsAt: z.date().optional(),
  endsAt: z.date().optional(),
})

// Cart validations
export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
})

// Checkout validations
export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  region: z.string().min(1, 'Region is required'),
  postalCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  requireOTP: z.boolean().optional(),
  couponCode: z.string().optional(),
})

export const otpVerificationSchema = z.object({
  orderId: z.string().min(1),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

// Popup validations
export const popupSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional(),
  targeting: z.object({
    paths: z.array(z.string()).default([]),
    devices: z.array(z.enum(['mobile', 'desktop'])).default(['mobile', 'desktop']),
    utm: z.array(z.string()).optional(),
  }),
  capping: z.object({
    perSession: z.number().int().min(1).optional(),
    perDay: z.number().int().min(1).optional(),
    cooldownHours: z.number().int().min(1).optional(),
  }),
  schedule: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    timeRanges: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })).optional(),
  }).optional(),
  abGroup: z.enum(['A', 'B']).optional(),
  priority: z.number().int().default(0),
})

// Search and filter validations
export const productSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
  sort: z.enum(['newest', 'oldest', 'price-asc', 'price-desc', 'name-asc', 'name-desc']).default('newest'),
})
