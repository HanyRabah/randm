import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/providers/session-provider'
import { CartProvider } from '@/contexts/cart-context'
import { WishlistProvider } from '@/contexts/wishlist-context'
import { AnalyticsScripts } from '@/components/analytics/analytics-scripts'
import { WebVitals } from '@/components/analytics/web-vitals'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getSeoSettings } from '@/lib/seo'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings()
  
  return {
    title: seoSettings.siteName,
    description: seoSettings.siteDescription,
    keywords: seoSettings.siteKeywords,
    icons: seoSettings.faviconUrl ? {
      icon: seoSettings.faviconUrl,
      shortcut: seoSettings.faviconUrl,
    } : undefined,
    verification: {
      google: seoSettings.googleAnalyticsId || undefined,
    },
    robots: seoSettings.metaRobots,
    openGraph: {
      title: seoSettings.siteName,
      description: seoSettings.siteDescription,
      url: seoSettings.siteUrl,
      siteName: seoSettings.siteName,
      images: seoSettings.ogImageUrl ? [{
        url: seoSettings.ogImageUrl,
        width: 1200,
        height: 630,
        alt: seoSettings.siteName,
      }] : undefined,
      locale: seoSettings.language === 'ar' ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoSettings.siteName,
      description: seoSettings.siteDescription,
      creator: seoSettings.twitterHandle || undefined,
      images: seoSettings.ogImageUrl ? [seoSettings.ogImageUrl] : undefined,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seoSettings = await getSeoSettings()
  
  return (
    <html lang={seoSettings.language}>
      <body className={inter.className}>
        <AnalyticsScripts
          googleAnalyticsId={seoSettings.googleAnalyticsId}
          googleTagManagerId={seoSettings.googleTagManagerId}
          facebookPixelId={seoSettings.facebookPixelId}
        />
        <WebVitals analyticsId={seoSettings.googleAnalyticsId || undefined} />
        <Analytics />
        <SpeedInsights />
        <SessionProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
