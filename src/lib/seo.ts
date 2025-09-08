import { Metadata } from 'next'
import { db } from '@/lib/db'

export interface SEOData {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
}

export interface SeoSettings {
  siteName: string
  siteDescription: string
  siteKeywords: string[]
  siteUrl: string
  logoUrl?: string | null
  faviconUrl?: string | null
  ogImageUrl?: string | null
  twitterHandle?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  linkedinUrl?: string | null
  googleAnalyticsId?: string | null
  googleTagManagerId?: string | null
  facebookPixelId?: string | null
  metaRobots: string
  currency: string
  currencySymbol: string
  language: string
  country: string
  timezone: string
}

// Cache for SEO settings to avoid repeated database calls
let cachedSeoSettings: SeoSettings | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getSeoSettings(): Promise<SeoSettings> {
  const now = Date.now()
  
  // Return cached settings if still valid
  if (cachedSeoSettings && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedSeoSettings
  }

  try {
    let settings = await db.seoSettings.findFirst()
    
    // Create default settings if none exist
    if (!settings) {
      settings = await db.seoSettings.create({
        data: {
          siteName: 'R&M Store',
          siteDescription: 'Premium furniture and home decor with Cash on Delivery',
          siteKeywords: ['furniture', 'home decor', 'cash on delivery', 'Egypt'],
          siteUrl: 'https://rmstore.com',
          metaRobots: 'index, follow',
          currency: 'EGP',
          currencySymbol: 'EGP',
          language: 'ar',
          country: 'Egypt',
          timezone: 'Africa/Cairo',
        }
      })
    }

    cachedSeoSettings = settings
    cacheTimestamp = now
    return settings
  } catch (error) {
    console.error('Failed to fetch SEO settings:', error)
    
    // Return fallback settings
    return {
      siteName: 'R&M Store',
      siteDescription: 'Premium furniture and home decor with Cash on Delivery',
      siteKeywords: ['furniture', 'home decor', 'cash on delivery', 'Egypt'],
      siteUrl: 'https://rmstore.com',
      logoUrl: null,
      faviconUrl: null,
      ogImageUrl: null,
      twitterHandle: null,
      facebookUrl: null,
      instagramUrl: null,
      linkedinUrl: null,
      googleAnalyticsId: null,
      googleTagManagerId: null,
      facebookPixelId: null,
      metaRobots: 'index, follow',
      currency: 'EGP',
      currencySymbol: 'EGP',
      language: 'ar',
      country: 'Egypt',
      timezone: 'Africa/Cairo',
    }
  }
}

export async function generateMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
}: SEOData = {}): Promise<Metadata> {
  const seoSettings = await getSeoSettings()
  
  const finalTitle = title || seoSettings.siteName
  const finalDescription = description || seoSettings.siteDescription
  const finalImage = image || seoSettings.ogImageUrl || '/og-image.jpg'
  const finalUrl = url || seoSettings.siteUrl
  
  const fullTitle = finalTitle.includes(seoSettings.siteName) ? finalTitle : `${finalTitle} | ${seoSettings.siteName}`
  
  return {
    title: fullTitle,
    description: finalDescription,
    keywords: seoSettings.siteKeywords,
    authors: [{ name: seoSettings.siteName }],
    creator: seoSettings.siteName,
    publisher: seoSettings.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: fullTitle,
      description: finalDescription,
      images: [{ 
        url: finalImage,
        width: 1200,
        height: 630,
        alt: finalTitle
      }],
      url: finalUrl,
      type: type === 'product' ? 'website' : type,
      siteName: seoSettings.siteName,
      locale: seoSettings.language === 'ar' ? 'ar_EG' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: finalDescription,
      images: [finalImage],
      creator: seoSettings.twitterHandle || '@rmstore',
    },
    robots: seoSettings.metaRobots,
    verification: {
      google: seoSettings.googleAnalyticsId,
    },
    icons: seoSettings.faviconUrl ? {
      icon: seoSettings.faviconUrl,
      shortcut: seoSettings.faviconUrl,
    } : undefined,
  }
}

export function generateProductJsonLd(product: {
  name: string
  description?: string
  image?: string[]
  price: number
  currency?: string
  availability?: 'InStock' | 'OutOfStock'
  brand?: string
  sku?: string
  category?: string
  condition?: string
  url?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    sku: product.sku,
    category: product.category,
    condition: product.condition || 'NewCondition',
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Furniture Store',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'EGP',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: 'Furniture Store',
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      itemCondition: `https://schema.org/${product.condition || 'NewCondition'}`,
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: product.currency || 'EGP',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '12',
    },
  }
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
