'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Globe, Search, Share2, BarChart3, Palette } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface SeoSettings {
  id: string
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
  createdAt: string
  updatedAt: string
}

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState<SeoSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')

  // Load SEO settings
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/seo-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load SEO settings',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load SEO settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/seo-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        toast({
          title: 'Success',
          description: 'SEO settings updated successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update SEO settings',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update SEO settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof SeoSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const addKeyword = () => {
    if (!keywordInput.trim() || !settings) return
    const newKeywords = [...settings.siteKeywords, keywordInput.trim()]
    updateField('siteKeywords', newKeywords)
    setKeywordInput('')
  }

  const removeKeyword = (index: number) => {
    if (!settings) return
    const newKeywords = settings.siteKeywords.filter((_, i) => i !== index)
    updateField('siteKeywords', newKeywords)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">Failed to load SEO settings</h3>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Settings</h1>
          <p className="text-muted-foreground">
            Manage your website's SEO and metadata settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Basic Settings
            </CardTitle>
            <CardDescription>
              Core website information and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateField('siteName', e.target.value)}
                placeholder="Your website name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateField('siteDescription', e.target.value)}
                placeholder="A brief description of your website"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                type="url"
                value={settings.siteUrl}
                onChange={(e) => updateField('siteUrl', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaRobots">Meta Robots</Label>
              <Input
                id="metaRobots"
                value={settings.metaRobots}
                onChange={(e) => updateField('metaRobots', e.target.value)}
                placeholder="index, follow"
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO Keywords
            </CardTitle>
            <CardDescription>
              Keywords that describe your website content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Add a keyword"
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} variant="outline">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {settings.siteKeywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeKeyword(index)}
                >
                  {keyword} ×
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Media Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Media Assets
            </CardTitle>
            <CardDescription>
              Logo, favicon, and social sharing images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={settings.logoUrl || ''}
                onChange={(e) => updateField('logoUrl', e.target.value)}
                placeholder="https://yourwebsite.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                type="url"
                value={settings.faviconUrl || ''}
                onChange={(e) => updateField('faviconUrl', e.target.value)}
                placeholder="https://yourwebsite.com/favicon.ico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImageUrl">Open Graph Image URL</Label>
              <Input
                id="ogImageUrl"
                type="url"
                value={settings.ogImageUrl || ''}
                onChange={(e) => updateField('ogImageUrl', e.target.value)}
                placeholder="https://yourwebsite.com/og-image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Media
            </CardTitle>
            <CardDescription>
              Social media profiles and handles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitterHandle">Twitter Handle</Label>
              <Input
                id="twitterHandle"
                value={settings.twitterHandle || ''}
                onChange={(e) => updateField('twitterHandle', e.target.value)}
                placeholder="@yourhandle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                type="url"
                value={settings.facebookUrl || ''}
                onChange={(e) => updateField('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                type="url"
                value={settings.instagramUrl || ''}
                onChange={(e) => updateField('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={settings.linkedinUrl || ''}
                onChange={(e) => updateField('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Tracking */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics & Tracking
            </CardTitle>
            <CardDescription>
              Google Analytics, Tag Manager, and social media pixels
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                placeholder="GA4-XXXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
              <Input
                id="googleTagManagerId"
                value={settings.googleTagManagerId || ''}
                onChange={(e) => updateField('googleTagManagerId', e.target.value)}
                placeholder="GTM-XXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={settings.facebookPixelId || ''}
                onChange={(e) => updateField('facebookPixelId', e.target.value)}
                placeholder="123456789012345"
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Localization Settings</CardTitle>
            <CardDescription>
              Currency, language, and regional settings
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                placeholder="EGP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currencySymbol">Currency Symbol</Label>
              <Input
                id="currencySymbol"
                value={settings.currencySymbol}
                onChange={(e) => updateField('currencySymbol', e.target.value)}
                placeholder="EGP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={settings.language}
                onChange={(e) => updateField('language', e.target.value)}
                placeholder="ar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={settings.country}
                onChange={(e) => updateField('country', e.target.value)}
                placeholder="Egypt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={settings.timezone}
                onChange={(e) => updateField('timezone', e.target.value)}
                placeholder="Africa/Cairo"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
