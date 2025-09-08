-- CreateTable
CREATE TABLE "SeoSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'R&M Store',
    "siteDescription" TEXT NOT NULL DEFAULT 'Premium furniture and home decor with Cash on Delivery',
    "siteKeywords" TEXT[] DEFAULT ARRAY['furniture', 'home decor', 'cash on delivery', 'Egypt']::TEXT[],
    "siteUrl" TEXT NOT NULL DEFAULT 'https://rmstore.com',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "ogImageUrl" TEXT,
    "twitterHandle" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "googleAnalyticsId" TEXT,
    "googleTagManagerId" TEXT,
    "facebookPixelId" TEXT,
    "metaRobots" TEXT NOT NULL DEFAULT 'index, follow',
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "currencySymbol" TEXT NOT NULL DEFAULT 'EGP',
    "language" TEXT NOT NULL DEFAULT 'ar',
    "country" TEXT NOT NULL DEFAULT 'Egypt',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
);
