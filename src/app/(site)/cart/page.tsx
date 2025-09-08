import { Suspense } from 'react'
import { getCart } from '@/server/actions/cart'
import { getAppliedCoupon } from '@/server/actions/coupons'
import { CartItems } from '@/components/cart/cart-items'
import { CartSummary } from '@/components/cart/cart-summary'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, ArrowRight, Sparkles, Crown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'

export async function generateMetadata() {
  return await generateSeoMetadata({
    title: 'Shopping Cart - Review Your Items',
    description: 'Review your selected furniture items and proceed to secure checkout with Cash on Delivery option available.',
    url: '/cart',
  })
}

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const cart = await getCart()
  const appliedCoupon = await getAppliedCoupon()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col">
        {/* Empty Cart Hero Section */}
        <section className="relative min-h-[50vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
              alt="Empty shopping cart"
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          </div>
          
          <div className="container relative z-10 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-amber-700" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Your Cart is Empty
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Discover our premium furniture collection and start building your dream space today.
              </p>
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
                <Link href="/" className="flex items-center">
                  Explore Collection
                  <Sparkles className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Cart Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              <ShoppingBag className="w-4 h-4 mr-2" />
              {cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Review your selected items and proceed to secure checkout
            </p>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Crown className="w-4 h-4 mr-2" />
                  Your Selection
                </Badge>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  <span className="ml-3 text-gray-600">Loading cart items...</span>
                </div>
              }>
                <CartItems items={cart.items as any} />
              </Suspense>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Order Summary
                </Badge>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  <span className="ml-3 text-gray-600">Loading summary...</span>
                </div>
              }>
                <CartSummary items={cart.items as any} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
