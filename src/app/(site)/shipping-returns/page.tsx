import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, Package, RotateCcw, Shield, Clock, DollarSign, Crown, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return await generateSeoMetadata({
    title: 'Shipping & Returns - Delivery Information',
    description: 'Learn about Rana shipping options, delivery times, return policy, and exchange procedures. Fast delivery and hassle-free returns.',
    url: '/shipping-returns',
  })
}

export default function ShippingReturnsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Delivery and shipping"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        
        <div className="container relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              <Truck className="w-4 h-4 mr-2" />
              Fast & Reliable
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Shipping & Returns
            </h1>
            <p className="text-xl text-gray-300 mb-4 leading-relaxed">
              Fast delivery, easy returns, and exceptional service for your premium furniture purchases.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto py-16">

          {/* Shipping Information */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                <Truck className="w-4 h-4 mr-2" />
                Shipping Options
              </Badge>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Fast & Reliable Delivery
              </h2>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Free Shipping</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-3">
                    <Badge className="bg-green-100 text-green-800 border-green-200">Orders over 2000 EGP</Badge>
                    <p className="text-gray-600">3-7 business days delivery</p>
                    <p className="text-2xl font-bold text-green-600">Free</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Standard Shipping</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-3">
                    <Badge variant="outline" className="border-blue-200 text-blue-800">All orders</Badge>
                    <p className="text-gray-600">3-7 business days delivery</p>
                    <p className="text-2xl font-bold text-blue-600">150 EGP</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                  <CardTitle className="text-xl">Express Shipping</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-3">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">Rush delivery</Badge>
                    <p className="text-gray-600">1-2 business days delivery</p>
                    <p className="text-2xl font-bold text-amber-600">300 EGP</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Returns & Contact Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
              <CardHeader className="relative pb-6">
                <div className="text-center mb-6">
                  <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Returns & Support
                  </Badge>
                  <CardTitle className="text-3xl text-white">
                    Hassle-Free Returns
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <RotateCcw className="h-6 w-6 text-green-700" />
                    </div>
                    <h4 className="font-semibold text-green-300 mb-2">30-Day Returns</h4>
                    <p className="text-gray-300 text-sm">Full refund guarantee</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-700" />
                    </div>
                    <h4 className="font-semibold text-blue-300 mb-2">Quality Guarantee</h4>
                    <p className="text-gray-300 text-sm">Premium protection</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-amber-700" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Free Returns</h4>
                    <p className="text-gray-300 text-sm">No return shipping costs</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                      <Package className="h-6 w-6 text-purple-700" />
                    </div>
                    <h4 className="font-semibold text-purple-300 mb-2">Easy Process</h4>
                    <p className="text-gray-300 text-sm">Simple online returns</p>
                  </div>
                </div>
                
                <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <h4 className="font-semibold text-white mb-4 text-center">Need Help with Shipping or Returns?</h4>
                  <div className="grid gap-4 md:grid-cols-3 text-center">
                    <div>
                      <p className="font-medium text-green-300">Email Support</p>
                      <p className="text-gray-300 text-sm">support@rmstore.com</p>
                    </div>
                    <div>
                      <p className="font-medium text-green-300">Phone Support</p>
                      <p className="text-gray-300 text-sm">+20 100 123 4567</p>
                    </div>
                    <div>
                      <p className="font-medium text-green-300">Business Hours</p>
                      <p className="text-gray-300 text-sm">Sat-Thu 9AM-6PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
