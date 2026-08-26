import { Suspense } from 'react'
import { ProductGrid } from '@/components/product/product-grid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Truck, Shield, CreditCard, Star, Award, Users, Crown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { getFeaturedProducts } from '@/server/queries/products'
import { getCategories } from '@/server/queries/categories'
import { StructuredData } from '@/components/seo/structured-data'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return await generateSeoMetadata({
    title: 'Luxury Furniture & Premium Home Decor',
    description: 'Discover exquisite furniture and premium home decor. Curated collections of luxury pieces with Cash on Delivery. Transform your space with elegance.',
  })
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <>
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Luxury furniture showroom"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
        </div>
        
        <div className="container relative z-10 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/30">
                <Crown className="w-4 h-4 mr-2" />
                Premium Collection
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Luxury Living
                <span className="block text-amber-400">Redefined</span>
              </h1>
              <p className="text-xl leading-relaxed text-gray-300 mb-8">
                Discover our curated collection of premium furniture and home decor. 
                Each piece is handpicked for its exceptional quality, timeless design, 
                and unmatched craftsmanship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" asChild>
                  <Link href="/category/coffee-tables">
                    Explore Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" className="border border-white/40 text-white hover:bg-white/5 hover:border-white/60 bg-transparent" asChild>
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>
            
            {/* Featured Product Showcase */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <Image
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    alt="Premium sofa"
                    width={400}
                    height={300}
                    className="rounded-lg object-cover w-full"
                  />
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-white">Premium Comfort Sofa</h3>
                    <p className="text-gray-300 text-sm mt-1">Handcrafted Italian leather</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold text-amber-400">2,499 EGP</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Features Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">
              <Award className="w-4 h-4 mr-2" />
              Premium Experience
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Why customers choose us
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Experience luxury shopping with uncompromising quality, exceptional service, 
              and the convenience of modern e-commerce.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl font-bold">Flexible Payment</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Pay with confidence using Cash on Delivery. No upfront payment, no risk.
                </p>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Zero Risk Shopping
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold">White Glove Delivery</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Professional delivery and setup service. Your furniture placed exactly where you want it.
                </p>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Premium Service
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl font-bold">Lifetime Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Handpicked furniture built to last generations. Quality that speaks for itself.
                </p>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  Guaranteed Excellence
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-amber-600">10K+</div>
              <p className="text-sm text-muted-foreground font-medium">Happy Customers</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <p className="text-sm text-muted-foreground font-medium">Premium Products</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-emerald-600">99%</div>
              <p className="text-sm text-muted-foreground font-medium">Satisfaction Rate</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-600">4.9★</div>
              <p className="text-sm text-muted-foreground font-medium">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Categories Section */}
      <section className="py-24 sm:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/30">
              <Crown className="w-4 h-4 mr-2" />
              Curated Collections
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Explore Our Collections
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Discover handpicked furniture collections designed to transform your space into a luxury haven.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {categories.slice(0, 3).map((category: any) => (
              <Card key={category.id} className="group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-500 overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={`https://images.unsplash.com/photo-${category.name.toLowerCase().includes('sofa') ? '1555041469-a586c61ea9bc' : 
                          category.name.toLowerCase().includes('table') ? '1506439773-f8b2f1a13f93' : 
                          '1586023492125-27b2c045efd7'}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-amber-500/90 text-black font-semibold">
                      Premium
                    </Badge>
                  </div>
                </div>
                <CardHeader className="relative">
                  <CardTitle className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {category.description || `Discover our premium ${category.name.toLowerCase()} collection`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold group-hover:shadow-lg group-hover:shadow-amber-500/25 transition-all"
                  >
                    <Link href={`/category/${category.slug}`}>
                      Explore Collection
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">
              <Star className="w-4 h-4 mr-2" />
              Bestsellers
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Featured Products
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Handpicked pieces that our customers love most. Each item represents the perfect 
              blend of style, comfort, and craftsmanship.
            </p>
          </div>
          
          <Suspense fallback={
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          }>
            <ProductGrid 
              products={featuredProducts} 
              pagination={{ page: 1, limit: 6, total: featuredProducts.length, pages: 1 }}
            />
          </Suspense>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200">
              <Users className="w-4 h-4 mr-2" />
              Customer Stories
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Real experiences from real customers who transformed their homes with us.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-muted-foreground mb-6 italic">
                  "The quality exceeded my expectations. The sofa is incredibly comfortable and 
                  the craftsmanship is outstanding. Worth every penny!"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Interior Designer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-muted-foreground mb-6 italic">
                  "Cash on delivery made it so easy to shop. The delivery team was professional 
                  and set everything up perfectly. Highly recommend!"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Architect</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-muted-foreground mb-6 italic">
                  "Beautiful furniture that transformed our living room. The attention to detail 
                  and customer service is exceptional. Will definitely shop again!"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    E
                  </div>
                  <div>
                    <p className="font-semibold">Emily Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Homeowner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
