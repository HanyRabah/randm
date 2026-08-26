import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema for SEO settings
const seoSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().min(1, 'Site description is required'),
  siteKeywords: z.array(z.string()).min(1, 'At least one keyword is required'),
  siteUrl: z.string().url('Valid URL is required'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  ogImageUrl: z.string().url().optional().or(z.literal('')),
  twitterHandle: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  googleAnalyticsId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  metaRobots: z.string().default('index, follow'),
  currency: z.string().default('EGP'),
  currencySymbol: z.string().default('EGP'),
  language: z.string().default('ar'),
  country: z.string().default('Egypt'),
  timezone: z.string().default('Africa/Cairo'),
})

// GET /api/admin/seo-settings - Get SEO settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the first (and should be only) SEO settings record
    let seoSettings = await db.seoSettings.findFirst()

    // If no settings exist, create default ones
    if (!seoSettings) {
      seoSettings = await db.seoSettings.create({
        data: {
          siteName: 'Rana',
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

    return NextResponse.json(seoSettings)
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/seo-settings - Update SEO settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validationResult = seoSettingsSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Convert empty strings to null for optional URL fields
    const processedData = {
      ...data,
      logoUrl: data.logoUrl || null,
      faviconUrl: data.faviconUrl || null,
      ogImageUrl: data.ogImageUrl || null,
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      twitterHandle: data.twitterHandle || null,
      googleAnalyticsId: data.googleAnalyticsId || null,
      googleTagManagerId: data.googleTagManagerId || null,
      facebookPixelId: data.facebookPixelId || null,
    }

    // Check if settings already exist
    const existingSettings = await db.seoSettings.findFirst()

    let seoSettings
    if (existingSettings) {
      // Update existing settings
      seoSettings = await db.seoSettings.update({
        where: { id: existingSettings.id },
        data: processedData
      })
    } else {
      // Create new settings
      seoSettings = await db.seoSettings.create({
        data: processedData
      })
    }

    return NextResponse.json(seoSettings)
  } catch (error) {
    console.error('Error updating SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to update SEO settings' },
      { status: 500 }
    )
  }
}
