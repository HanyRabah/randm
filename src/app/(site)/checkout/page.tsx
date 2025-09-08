import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCart } from '@/server/actions/cart'
import { getAppliedCoupon } from '@/server/actions/coupons'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { CheckoutSummary } from '@/components/checkout/checkout-summary'
import { Badge } from '@/components/ui/badge'
import { Shield, CreditCard, Truck, Crown } from 'lucide-react'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'

export async function generateMetadata() {
  return await generateSeoMetadata({
    title: 'Secure Checkout - Complete Your Order',
    description: 'Complete your furniture order securely with multiple payment options including Cash on Delivery. Fast processing and reliable delivery.',
    url: '/checkout',
  })
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const cart = await getCart()
  const appliedCoupon = await getAppliedCoupon()

  if (!cart || cart.items.length === 0) {
    redirect('/cart')
  }

  return (
    <div className="flex flex-col">
      {/* Checkout Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Secure Checkout
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Complete Your Order
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Secure payment processing with Cash on Delivery option available
            </p>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-8">
        <div className="container">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
            <div className="flex items-center space-x-2 text-green-700">
              <Shield className="w-5 h-5" />
              <span className="font-medium">SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Cash on Delivery</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-700">
              <Truck className="w-5 h-5" />
              <span className="font-medium">Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-2 text-amber-700">
              <Crown className="w-5 h-5" />
              <span className="font-medium">Premium Service</span>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment & Delivery
                </Badge>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading checkout form...</span>
                </div>
              }>
                <CheckoutForm />
              </Suspense>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Crown className="w-4 h-4 mr-2" />
                  Order Summary
                </Badge>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  <span className="ml-3 text-gray-600">Loading order summary...</span>
                </div>
              }>
                <CheckoutSummary items={cart.items as any} appliedCoupon={appliedCoupon} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
