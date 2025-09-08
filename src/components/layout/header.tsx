import Link from 'next/link'
import Image from 'next/image'
import { Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchBar } from './search-bar'
import { MiniCart } from '@/components/cart/mini-cart'
import { CategoriesDropdown } from './categories-dropdown'
import { UserNav } from './user-nav'
import { getSeoSettings } from '@/lib/seo'
import { Suspense } from 'react'

export async function Header() {
  const seoSettings = await getSeoSettings()
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {seoSettings.logoUrl ? (
            <Image
              src={seoSettings.logoUrl}
              alt={seoSettings.siteName}
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          ) : (
            <div className="font-bold text-xl">{seoSettings.siteName}</div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 ml-6">
          <Suspense fallback={<div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>}>
            <CategoriesDropdown />
          </Suspense>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            Contact Us
          </Link>
          <Link href="/shipping-returns" className="text-sm font-medium transition-colors hover:text-primary">
            Shipping & Returns
          </Link>
        </nav>

        <div className="flex items-center space-x-4 ml-auto">
          {/* Search */}
          <div className="hidden md:flex items-center space-x-2">
            <SearchBar />
          </div>

          {/* User menu */}
          <UserNav />

          {/* Cart */}
          <MiniCart />
        </div>
      </div>
    </header>
  )
}
