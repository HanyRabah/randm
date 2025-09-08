'use client'

import { useEffect } from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

interface WebVitalsProps {
  analyticsId?: string
}

export function WebVitals({ analyticsId }: WebVitalsProps) {
  useEffect(() => {
    // Send Web Vitals to analytics service
    function sendToAnalytics(metric: any) {
      // Send to Vercel Analytics if available
      if (typeof window !== 'undefined' && window.va) {
        window.va('track', 'Web Vitals', {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        })
      }

      // Send to Google Analytics if available
      if (typeof window !== 'undefined' && window.gtag && analyticsId) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        })
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
        })
      }
    }

    // Measure all Web Vitals (INP replaces FID in newer versions)
    onCLS(sendToAnalytics)
    onINP(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  }, [analyticsId])

  return null
}

// Extend window type for TypeScript
declare global {
  interface Window {
    va?: (event: string, name: string, properties?: any) => void
    gtag?: (command: string, action: string, parameters?: any) => void
  }
}
