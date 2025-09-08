'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Clock, 
  Zap, 
  Eye, 
  TrendingUp, 
  Server,
  Database,
  Globe,
  RefreshCw
} from 'lucide-react'

interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  description: string
  threshold: { good: number; poor: number }
}

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalRequests: number
}

export default function PerformancePage() {
  const [webVitals, setWebVitals] = useState<WebVitalsMetric[]>([])
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - in production, this would come from your analytics API
  useEffect(() => {
    const mockWebVitals: WebVitalsMetric[] = [
      {
        name: 'LCP',
        value: 1.2,
        rating: 'good',
        description: 'Largest Contentful Paint',
        threshold: { good: 2.5, poor: 4.0 }
      },
      {
        name: 'FID',
        value: 85,
        rating: 'needs-improvement',
        description: 'First Input Delay',
        threshold: { good: 100, poor: 300 }
      },
      {
        name: 'CLS',
        value: 0.05,
        rating: 'good',
        description: 'Cumulative Layout Shift',
        threshold: { good: 0.1, poor: 0.25 }
      },
      {
        name: 'FCP',
        value: 1.1,
        rating: 'good',
        description: 'First Contentful Paint',
        threshold: { good: 1.8, poor: 3.0 }
      },
      {
        name: 'TTFB',
        value: 0.3,
        rating: 'good',
        description: 'Time to First Byte',
        threshold: { good: 0.8, poor: 1.8 }
      }
    ]

    const mockCacheStats: CacheStats = {
      hits: 1250,
      misses: 180,
      hitRate: 87.4,
      totalRequests: 1430
    }

    setTimeout(() => {
      setWebVitals(mockWebVitals)
      setCacheStats(mockCacheStats)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500'
      case 'needs-improvement': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRatingBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'good': return 'default'
      case 'needs-improvement': return 'secondary'
      case 'poor': return 'destructive'
      default: return 'outline'
    }
  }

  const refreshData = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your site's performance metrics and optimization status
          </p>
        </div>
        <Button onClick={refreshData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="caching">API Caching</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {webVitals.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.name}
                  </CardTitle>
                  <Badge variant={getRatingBadgeVariant(metric.rating)}>
                    {metric.rating}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.name === 'CLS' 
                      ? metric.value.toFixed(3)
                      : metric.name === 'LCP' || metric.name === 'FCP' || metric.name === 'TTFB'
                      ? `${metric.value.toFixed(1)}s`
                      : `${metric.value}ms`
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Good</span>
                      <span>Poor</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getRatingColor(metric.rating)}`}
                        style={{ 
                          width: `${Math.min((metric.value / metric.threshold.poor) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Score
              </CardTitle>
              <CardDescription>
                Overall performance based on Core Web Vitals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <span className="text-2xl font-bold text-green-600">92</span>
                </div>
                <Progress value={92} className="w-full" />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-green-600">Good</div>
                    <div className="text-muted-foreground">3 metrics</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-yellow-600">Needs Work</div>
                    <div className="text-muted-foreground">1 metric</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">Poor</div>
                    <div className="text-muted-foreground">0 metrics</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caching" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {cacheStats.hitRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {cacheStats.hits} hits / {cacheStats.totalRequests} requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cacheStats.hits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Served from cache
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Misses</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cacheStats.misses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Served from database
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cacheStats.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>
                API endpoint caching statistics and optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">/api/products</div>
                    <div className="text-sm text-muted-foreground">Product listings cache</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">94% hit rate</div>
                    <div className="text-sm text-muted-foreground">60s TTL</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">/api/categories</div>
                    <div className="text-sm text-muted-foreground">Category data cache</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">98% hit rate</div>
                    <div className="text-sm text-muted-foreground">300s TTL</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">/api/admin/seo-settings</div>
                    <div className="text-sm text-muted-foreground">SEO settings cache</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">99% hit rate</div>
                    <div className="text-sm text-muted-foreground">300s TTL</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,543</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2s</div>
                <p className="text-xs text-muted-foreground">
                  -0.3s from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.5%</div>
                <p className="text-xs text-muted-foreground">
                  -2.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Core Web Vitals</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Good</div>
                <p className="text-xs text-muted-foreground">
                  All metrics passing
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vercel Analytics Integration</CardTitle>
              <CardDescription>
                Real-time performance monitoring and user analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Vercel Analytics</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Speed Insights</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Web Vitals Tracking</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Real User Monitoring</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
