import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Award, Truck, Shield, Crown, Star, ArrowRight, Sparkles } from 'lucide-react'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import Image from 'next/image'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return await generateSeoMetadata({
    title: 'About Us - Our Story & Mission',
    description: 'Learn about our story, mission, and commitment to providing premium furniture with exceptional service. Discover why thousands trust us for their home furnishing needs.',
    url: '/about',
  })
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Luxury furniture craftsmanship"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        
        <div className="container relative z-10 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-amber-500/20 text-amber-300 border-amber-500/30 px-4 py-2">
              <Crown className="w-4 h-4 mr-2" />
              Since 2020
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Our Story
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Crafting exceptional furniture experiences with passion, precision, and an unwavering commitment to luxury living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
                <Link href="/contact" className="flex items-center">
                  Get in Touch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg"  className="border-white/30 text-white hover:bg-white/10 px-8 py-3">
                <Link href="/category/coffee-tables" className="flex items-center">
                  Explore Collection
                  <Sparkles className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto py-16">
          {/* Story Section */}
          <div className="grid gap-12 lg:grid-cols-2 mb-16">
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">
                  <Star className="w-4 h-4 mr-2" />
                  Our Journey
                </Badge>
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Crafting Dreams Since 2020
                </h2>
              </div>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  Founded in 2020, we began as a small family business with a simple mission:
                  to make high-quality furniture accessible to everyone. What started in a small warehouse 
                  has grown into a trusted online destination for furniture lovers across the region.
                </p>
                <p>
                  We understand that furniture is more than just functional items – they're the pieces 
                  that make a house feel like home. That's why we carefully curate every product in our 
                  collection, ensuring it meets our high standards for quality, design, and value.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers, helping them create beautiful 
                  spaces they love to call home.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl transform rotate-3"></div>
              <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent mb-2">4+</div>
                      <p className="text-lg font-medium text-gray-700">Years of Excellence</p>
                    </div>
                    <div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent mb-2">10K+</div>
                      <p className="text-lg font-medium text-gray-700">Happy Customers</p>
                    </div>
                    <div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent mb-2">500+</div>
                      <p className="text-lg font-medium text-gray-700">Premium Products</p>
                    </div>
                    <div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent mb-2">99%</div>
                      <p className="text-lg font-medium text-gray-700">Satisfaction Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                <Crown className="w-4 h-4 mr-2" />
                Our Values
              </Badge>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                What Drives Us Forward
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-8 w-8 text-amber-600" />
                  </div>
                  <CardTitle className="text-xl">Quality First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    We source only the finest materials and work with trusted manufacturers 
                    to ensure every piece meets our rigorous quality standards.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Customer Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Your satisfaction is our priority. We provide exceptional service 
                    from browsing to delivery and beyond.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Fast Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    We understand you're excited about your new furniture. 
                    That's why we offer quick, reliable delivery across the region.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Trust & Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Shop with confidence knowing your personal information is secure 
                    and your purchases are protected by our guarantee.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mission Section */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl transform -rotate-1"></div>
            <Card className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
              <CardContent className="relative p-12 text-center">
                <Badge className="mb-6 bg-amber-500/20 text-amber-300 border-amber-500/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Our Mission
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Transforming Houses into Homes
                </h2>
                <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  To provide exceptional furniture and decor that combines style, comfort, and affordability. 
                  We're committed to making beautiful living accessible to everyone, one piece at a time.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="text-center">
            <div className="mb-12">
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                <Shield className="w-4 h-4 mr-2" />
                Why Choose Us
              </Badge>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Premium Benefits & Guarantees
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              <Badge variant="outline" className="px-6 py-4 text-base border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors">
                Free Shipping on Orders Over 2000 EGP
              </Badge>
              <Badge variant="outline" className="px-6 py-4 text-base border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors">
                30-Day Return Policy
              </Badge>
              <Badge variant="outline" className="px-6 py-4 text-base border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-colors">
                Cash on Delivery Available
              </Badge>
              <Badge variant="outline" className="px-6 py-4 text-base border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 transition-colors">
                Expert Customer Support
              </Badge>
              <Badge variant="outline" className="px-6 py-4 text-base border-red-200 bg-red-50 text-red-800 hover:bg-red-100 transition-colors">
                Quality Guarantee
              </Badge>
              <Badge variant="outline" className="px-6 py-4 text-base border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-colors">
                Professional Assembly
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
