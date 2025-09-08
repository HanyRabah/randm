import Script from 'next/script'
import { getSeoSettings } from '@/lib/seo'

interface StructuredDataProps {
  type: 'website' | 'product' | 'organization' | 'breadcrumb'
  data?: any
}

export async function StructuredData({ type, data }: StructuredDataProps) {
  const seoSettings = await getSeoSettings()

  const generateStructuredData = () => {
    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: seoSettings.siteName,
          description: seoSettings.siteDescription,
          url: seoSettings.siteUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${seoSettings.siteUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        }

      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: seoSettings.siteName,
          description: seoSettings.siteDescription,
          url: seoSettings.siteUrl,
          logo: seoSettings.logoUrl || undefined,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            url: `${seoSettings.siteUrl}/contact`,
          },
          sameAs: [
            seoSettings.facebookUrl,
            seoSettings.instagramUrl,
            seoSettings.linkedinUrl,
            seoSettings.twitterHandle ? `https://twitter.com/${seoSettings.twitterHandle.replace('@', '')}` : null,
          ].filter(Boolean),
        }

      case 'product':
        if (!data) return null
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.images || [],
          url: `${seoSettings.siteUrl}/product/${data.slug}`,
          sku: data.sku,
          brand: {
            '@type': 'Brand',
            name: seoSettings.siteName,
          },
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: seoSettings.currency,
            availability: data.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: seoSettings.siteName,
            },
          },
        }

      case 'breadcrumb':
        if (!data?.items) return null
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${seoSettings.siteUrl}${item.href}`,
          })),
        }

      default:
        return null
    }
  }

  const structuredData = generateStructuredData()

  if (!structuredData) return null

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
